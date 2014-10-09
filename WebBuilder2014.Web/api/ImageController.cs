using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebBuilder2014.Common.Model;

namespace WebBuilder2014.Web.api
{
    public class ImageController : ApiController
    {
        private const string AccountKey = "ge9khc7oHm0gvbtBr6oJXc5gOIEIi09P35d5LtfnmJo";
        public static int count = 0;
        public static string Path = System.Web.HttpContext.Current.Server.MapPath("~/");
        string market = "en-us";
        // GET api/image
        public IEnumerable<ImageModel> Get(string query, string filter, int top, int skip)
        {
            ImageController.count = 0;
            return this.Search(query, filter, top, skip).ToArray();
        }

        // GET: api/Image/5
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/Image
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/Image/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Image/5
        public void Delete(int id)
        {
        }

        private List<ImageModel> Search(string query, string filter, int top, int skip)
        {
            List<ImageModel> searchResult = new List<ImageModel>();
            string folder = Regex.Replace(query, "[^A-Za-z0-9]", "_");

            if (!Directory.Exists(ImageController.Path + "/content/images/" + query))
            {
                Directory.CreateDirectory(ImageController.Path + "/content/images/" + query);
                // Create a Bing container.
                string rootUrl = "https://api.datamarket.azure.com/Bing/Search";
                var bingContainer = new Bing.BingSearchContainer(new Uri(rootUrl));

                // Configure bingContainer to use your credentials.
                bingContainer.Credentials = new NetworkCredential(AccountKey, AccountKey);

                // Build the query, limiting to 10 results.
                var imageQuery =
                    bingContainer.Image(query, null, market, "Strict", null, null, filter);
                imageQuery = imageQuery.AddQueryOption("$top", top);
                imageQuery = imageQuery.AddQueryOption("$skip", skip);

                // Run the query and display the results.
                var imageResults = imageQuery.Execute();


                query = folder;

                int count = 0;
                foreach (Bing.ImageResult iResult in imageResults)
                {
                    count++;
                    searchResult.Add(new ImageModel()
                    {
                        Id = count,
                        Height = iResult.Height,
                        Width = iResult.Width,
                        Url = iResult.MediaUrl,
                        Name = query + "_" + count + ".jpg"
                    });
                }






                DownloadImage(searchResult, query);


                foreach (var item in searchResult)
                {
                    item.Url = "/content/images/" + query + "/" + item.Id + ".jpg";
                }
            }
            else
            {

                searchResult = GetFiles("/content/images/" + folder + "/");
            }
            return searchResult;
        }

    }
}
