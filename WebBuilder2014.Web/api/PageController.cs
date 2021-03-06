﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using WebBuilder2014.BLL;
using WebBuilder2014.Common.Model;

namespace WebBuilder2014.Web.api
{
    public class PageController : ApiController
    {
        BuilderService service=new BuilderService();
        // GET: api/Page
        public IEnumerable<string> Get()
        {
            var pages = service.GetWBPages();
            return pages;
        }

        // GET: api/Page/5
        public HttpResponseMessage Get(string id)
        {
            var section = service.GetWBPageByCode(id);
            if (section != null)
            {
                var resp = new HttpResponseMessage()
                {
                    Content = new StringContent(section.Json)
                };
                resp.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                return resp;
            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "No Section");
            }
        }


        // POST: api/Page
        public void Post(NodeModel node)
        {
            service.UpdateWBPage(node.Content.Replace(" ","_"),node);

        }

        // PUT: api/Page/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Page/5
        public void Delete(int id)
        {
        }
    }
}
