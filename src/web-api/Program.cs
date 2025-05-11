using web_api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddControllers();
builder.Services.AddSingleton<ChatHub>();
var app = builder.Build();

// app.UseHttpsRedirection();

app.UseWebSockets();
app.MapControllers();

app.Run();