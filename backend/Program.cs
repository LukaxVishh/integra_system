using backend.Context;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using backend.Configurations;

var builder = WebApplication.CreateBuilder(args);

// Adiciona serviços
builder.Services.AddControllers();

// Configurações modulares
builder.Services.AddCorsConfiguration();
builder.Services.AddSwaggerConfiguration();
builder.Services.AddDbContextConfiguration(builder.Configuration);
builder.Services.AddIdentityConfiguration();
builder.Services.AddCookieConfiguration();

// Injeção de dependências personalizadas
builder.Services.AddScoped<ISeedUserRoleInitial, SeedUserRoleInitial>();

var app = builder.Build();

// Seed inicial de usuários e roles
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var seeder = services.GetRequiredService<ISeedUserRoleInitial>();
    // await seeder.SeedRolesAsync();
    // await seeder.SeedUsersAsync();
}

// Middleware
app.UseSwaggerDocumentation(app.Environment);
app.UseCors("AllowReactApp");
app.AddStaticFiles();
// app.UseHttpsRedirection(); // descomente se usar HTTPS
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
