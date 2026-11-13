using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Mitsuhide.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Context (MySQL with Pomelo EF Core)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost;Port=3306;Database=mitsuhide_cost_db;User=root;Password=root;CharSet=utf8mb4;";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // Configure MySQL with Pomelo
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

// 2. CORS Policy for React Frontend (Vite)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 3. Controllers
builder.Services.AddControllers();

// 4. Swagger / OpenAPI Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "株式会社ミツヒデ 原価管理システム API",
        Version = "v1",
        Description = "Construction Cost, Order, Budget & Sales ERP System API"
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

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
