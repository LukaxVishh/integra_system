using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.FileProviders;
using System.IO;

namespace backend.Configurations
{
    public static class StaticFilesConfig
    {
        public static void AddStaticFiles(this WebApplication app)
        {
            app.UseStaticFiles();
        }
    }
}
