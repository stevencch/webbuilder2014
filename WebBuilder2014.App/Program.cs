using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebBuilder2014.BLL;
using WebBuilder2014.BLL.Helper;

namespace WebBuilder2014.App
{
    class Program
    {
        static void Main(string[] args)
        {
            BuilderService service = new BuilderService();
            var path = AppDomain.CurrentDomain.BaseDirectory + @"..\..\..\WebBuilder2014.Web\Content\templates\t1\";
            var html=File.ReadAllText(path + "section0101.html");
            html = HtmlHelper.CleanUp(html);
            var node = HtmlHelper.ConvertToNode(html);
            service.UpdatePageSection("s0101",node);

        }
    }
}
