using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(WebBuilder2014.Web.Startup))]
namespace WebBuilder2014.Web
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
