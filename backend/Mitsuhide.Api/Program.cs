using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Mitsuhide.Api.Services;
using Mitsuhide.Application.Common.Security;
using Mitsuhide.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Context (Microsoft SQL Server 2019 / Express)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=.\\SQLEXPRESS;Database=mitsuhide_cost_db;Trusted_Connection=True;TrustServerCertificate=True;";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

// 2. Application Services
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// 3. JWT Bearer Authentication & Authorization
var jwtKey = builder.Configuration["Jwt:Key"] ?? "MitsuhideEnterpriseCostManagementSecretKey2026!#SecureJWT#EnterpriseGradeAuth";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MitsuhideApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MitsuhideClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(5)
    };
});

builder.Services.AddAuthorization();

// 4. CORS Policy for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:3001", "http://127.0.0.1:3000")
              .SetIsOriginAllowed(origin =>
              {
                  if (string.IsNullOrEmpty(origin)) return false;
                  if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                  {
                      return uri.Host == "localhost" || uri.Host == "127.0.0.1" || uri.Host.StartsWith("192.168.") || uri.Host.StartsWith("10.");
                  }
                  return false;
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 5. Controllers with unified validation error response formatting
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .SelectMany(e => e.Value!.Errors.Select(x => !string.IsNullOrWhiteSpace(x.ErrorMessage) ? x.ErrorMessage : "入力形式が不正です。"))
                .ToList();
            var message = string.Join(" ", errors);
            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new
            {
                message = !string.IsNullOrWhiteSpace(message) ? message : "入力データに不備があります。入力内容を確認してください。",
                errors = errors
            });
        };
    });

// 6. Swagger / OpenAPI Documentation with JWT Bearer Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "株式会社ミツヒデ 原価管理システム API",
        Version = "v1",
        Description = "Construction Cost, Order, Budget & Sales ERP System API"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mitsuhide Cost API v1");
        c.RoutePrefix = "swagger";
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
