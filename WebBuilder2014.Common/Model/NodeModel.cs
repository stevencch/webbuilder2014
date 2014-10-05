using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebBuilder2014.Common.Model
{
    public class NodeModel : ICloneable
    {
        public string Type { get; set; }

        public string Content { get; set; }

        public List<NodeModel> Children { get; set; }

        public List<AttributeModel> Attributes { get; set; }

        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();

            if (Type.Equals("#text"))
            {
                sb.Append(Content);
            }
            else if (Type.Equals("br"))
            {
                sb.Append("<br/>");
            }
            else
            {
                sb.Append("<");
                sb.Append(Type);
                foreach (var attr in Attributes)
                {
                    sb.Append(" ");
                    sb.Append(attr.Key);
                    sb.Append("=\"");
                    sb.Append(attr.Value);
                    sb.Append("\"");
                    sb.Append(" ");
                }
                sb.Append(">");
                foreach (var child in Children)
                {
                    sb.Append(child.ToString());
                }
                sb.Append("</");
                sb.Append(Type);
                sb.Append(">");
            }

            return sb.ToString();

        }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}
