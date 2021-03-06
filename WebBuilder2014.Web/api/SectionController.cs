﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using WebBuilder2014.BLL;

namespace WebBuilder2014.Web.api
{
    public class SectionController : ApiController
    {
        BuilderService service = new BuilderService();
        // GET: api/Section
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET: api/Section/5
        public HttpResponseMessage Get(string id)
        {
            var section = service.GetPageSectionByCode(id);
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

        // POST: api/Section
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/Section/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Section/5
        public void Delete(int id)
        {
        }
    }
}
