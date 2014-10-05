using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebBuilder2014.Common.Entity;
using WebBuilder2014.Common.Model;
using WebBuilder2014.DAL;

namespace WebBuilder2014.BLL
{
    
    public class BuilderService
    {
        WBDbContext dbContext=new WBDbContext();

        public PageSection GetPageSectionByCode(string code)
        {
            PageSection result = dbContext.PageSections.Where(x => x.Code.Equals(code)).FirstOrDefault();
            return result;
        }

        public void UpdatePageSection(string code, NodeModel node)
        {
            try
            {
                PageSection result = GetPageSectionByCode(code);
                if (result != null)
                {
                    result.Json = node.ToString();
                }
                else
                {
                    dbContext.PageSections.Add(new PageSection()
                    {
                        Code = code,
                        Json = node.ToString()
                    });
                }
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                //TODO: Logger error
            }
        }
    }
}
