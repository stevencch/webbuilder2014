using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HtmlAgilityPack;
using WebBuilder2014.Common.Model;

namespace WebBuilder2014.BLL.Helper
{
    public class HtmlHelper
    {
        private static NodeModel currentNode = null;

        public static NodeModel ConvertToNode(string html)
        {
            NodeModel node = new NodeModel();
            HtmlDocument htmlDoc = new HtmlDocument();
            HtmlNode.ElementsFlags.Remove("form");
            htmlDoc.LoadHtml(html);
            var root = htmlDoc.DocumentNode.SelectSingleNode("/div");
            ConvertDocumentNode(root, node, null);
            return node;
        }

        private static void ConvertDocumentNode(HtmlNode html, NodeModel node, NodeModel parent)
        {
            node.Type = html.Name;
            if (html.Name.Equals("#text") && !parent.Type.Equals("style") && !parent.Type.Equals("script"))
            {
                if (currentNode == null)
                {
                    parent.Attributes.Add(new AttributeModel()
                    {
                        Key = "txtid",
                        Value = Guid.NewGuid().ToString().Replace("-", "")
                    });
                }
                node.Content = html.InnerText;
            }
            node.Attributes = html.Attributes.Select(x => new AttributeModel() { Key = x.Name, Value = x.Value }).ToList();
            var href = node.Attributes.Where(x => x.Key.Equals("href")).FirstOrDefault();
            var hrefskip = node.Attributes.Where(x => x.Key.Equals("hrefskip")).FirstOrDefault();
            if (node.Type == "a" && href != null && hrefskip == null)
            {
                href.Value = "javascript:void(0)";
            }
            if (node.Type == "img")
            {
                node.Attributes.Add(new AttributeModel() { Key = "imgid", Value = Guid.NewGuid().ToString().Replace("-", "") });
            }
            var bgimage = node.Attributes.Where(x => x.Key.Equals("bgimage")).FirstOrDefault();
            if (bgimage != null)
            {
                node.Attributes.Add(new AttributeModel() { Key = "imgid", Value = Guid.NewGuid().ToString().Replace("-", "") });
            }
            node.Children = new List<NodeModel>();
            var group = node.Attributes.Where(x => x.Key.Equals("group")).FirstOrDefault();
            if (group != null)
            {
                currentNode = node;
                node.Attributes.Add(new AttributeModel() { Key = "txtid", Value = Guid.NewGuid().ToString().Replace("-", "") });
            }
            foreach (var item in html.ChildNodes)
            {
                NodeModel child = new NodeModel();
                node.Children.Add(child);
                ConvertDocumentNode(item, child, node);
            }
            if (currentNode == node)
            {
                currentNode = null;
            }
        }

        public static string CleanUp(string html)
        {
            html = Regex.Replace(html, "<!--.*-->", "");
            html = Regex.Replace(html, @"\r\n", "");
            html = Regex.Replace(html, "[ ]+<", "<");
            html = Regex.Replace(html, ">[ ]+", ">");
            return html;
        }
    }
}
