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

            string[] sections =
            {
                "0101", "0102", "0103", "0104", "0105", "0106", "0107", "0108", "0109", "0110", "0111"
            };

            foreach (var section in sections)
            {
                var path = AppDomain.CurrentDomain.BaseDirectory + @"..\..\..\WebBuilder2014.Web\Content\templates\t01\";
                var html = File.ReadAllText(path + "section" + section + ".html");
                html = HtmlHelper.CleanUp(html);
                var node = HtmlHelper.ConvertToNode(html);
                service.UpdatePageSection("s" + section, node);
            }


            //string[] sections =
            //{
            //    "0001", "0002", "0003", "0004", "0005", "0006", "0007"
            //};
            //foreach (var section in sections)
            //{
            //    var path = AppDomain.CurrentDomain.BaseDirectory + @"..\..\..\WebBuilder2014.Web\Content\templates\t00\";
            //    var html = File.ReadAllText(path + "section" + section + ".html");
            //    html = HtmlHelper.CleanUp(html);
            //    var node = HtmlHelper.ConvertToNode(html);
            //    service.UpdatePageSection("s" + section, node);
            //}
            
        }
    }
}
