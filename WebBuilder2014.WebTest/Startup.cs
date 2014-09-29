using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(WebBuilder2014.WebTest.Startup))]
namespace WebBuilder2014.WebTest
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
