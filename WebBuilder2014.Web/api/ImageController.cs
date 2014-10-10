using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using WebBuilder2014.Common.Model;
using WebGrease.Css.Extensions;

namespace WebBuilder2014.Web.api
{
    public class ImageController : ApiController
    {
        private const string AccountKey = "ge9khc7oHm0gvbtBr6oJXc5gOIEIi09P35d5LtfnmJo";
        public static int count = 0;
        public static string Path = System.Web.HttpContext.Current.Server.MapPath("~/");
        public static string imagePath = "/content/image_folder/";
        public static string myFolderPath = ImageController.imagePath + "myfolder/";
        public static string myTempPath = ImageController.imagePath + "mytemp/";
        string market = "en-us";
        string rootUrl = "https://api.datamarket.azure.com/Bing/Search";
        // GET api/image
        public IEnumerable<ImageModel> Get(string query, string filter, int top, int skip)
        {
            ImageController.count = 0;
            return this.Search(query, filter, top, skip).ToArray();
        }

        // GET: api/Image/5
        public IEnumerable<ImageModel> Get(int id)
        {
            string imagePath = ImageController.myFolderPath;
            if (id == 1)
            {
                return GetFiles(imagePath).ToArray();
            }
            else
            {
                return null;
            }
        }

        // POST api/image
        public HttpResponseMessage Post()
        {

            HttpResponseMessage result = null;
            var httpRequest = HttpContext.Current.Request;

            // Check if files are available
            if (httpRequest.Files.Count > 0)
            {
                var files = new List<ImageModel>();
                Directory.GetFiles(ImageController.Path + ImageController.myTempPath).ForEach(x=>File.Delete(x));
                // interate the files and save on the server
                foreach (string f in httpRequest.Files)
                {
                    var postedFile = httpRequest.Files[f];
                    var filePath = ImageController.Path + ImageController.myTempPath + postedFile.FileName;
                    postedFile.SaveAs(filePath);
                    var file = new FileInfo(filePath);
                    var image = Image.FromFile(file.FullName);
                    files.Add(new ImageModel()
                    {
                        Id = 0,
                        Url = ImageController.myTempPath + file.Name,
                        Name = file.Name,
                        Height = image.Height,
                        Width = image.Width,
                    });
                }

                // return result
                result = Request.CreateResponse(HttpStatusCode.Created, files);
            }
            else
            {
                // return BadRequest (no file(s) available)
                result = Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            return result;
        }


        [Route("api/image/save")]
        public HttpResponseMessage Save(CropImageModel cropImage)
        {
            byte[] bytes = Convert.FromBase64String(cropImage.Data.Substring(22, cropImage.Data.Length - 22));
            var files = new List<ImageModel>();
            try
            {
                var filePath = ImageController.Path + ImageController.myFolderPath + "new_" + cropImage.Name;
                using (FileStream fs = new FileStream(filePath, FileMode.OpenOrCreate))
                {
                    fs.Write(bytes, 0, bytes.Count());
                    fs.Flush();
                }
                var file = new FileInfo(filePath);
                var image = Image.FromFile(file.FullName);
                files.Add(new ImageModel()
                {
                    Id = 0,
                    Url = myFolderPath + file.Name,
                    Name = file.Name,
                    Height = image.Height,
                    Width = image.Width,
                });
                return Request.CreateResponse(HttpStatusCode.OK,"new_" + cropImage.Name);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ex.Message);
            }
        }

        [Route("api/image/move")]
        public HttpResponseMessage Move(GenericModel model)
        {
            string url = model.String1;
            File.Copy(Path + url, Path + myFolderPath +  url.ToLower().Replace(imagePath,"new_").Replace("/","_"),true);
            return Request.CreateResponse(HttpStatusCode.OK, "new_" + url.ToLower().Replace(imagePath, "new_").Replace("/", "_"));
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

            if (!Directory.Exists(ImageController.Path + imagePath + query))
            {
                Directory.CreateDirectory(ImageController.Path + imagePath + query);
                // Create a Bing container.
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
                        Name = folder + "_" + count + ".jpg"
                    });
                }

                DownloadImage(searchResult, folder);
                foreach (var item in searchResult)
                {
                    item.Url = imagePath + folder + "/" + item.Id + ".jpg";
                }
            }
            else
            {
                searchResult = GetFiles(imagePath + folder + "/");
            }
            return searchResult;
        }

        private static List<ImageModel> GetFiles(string imagePath)
        {
            List<ImageModel> result = new List<ImageModel>();

            DirectoryInfo di = new DirectoryInfo(Path + imagePath);
            var files = di.GetFiles();
            foreach (var file in files)
            {
                var image = Image.FromFile(file.FullName);
                result.Add(new ImageModel()
                {
                    Id = 0,
                    Url = imagePath + file.Name,
                    Name = file.Name,
                    Height = image.Height,
                    Width = image.Width,
                });
            }
            return result;
        }

        private void DownloadImage(List<ImageModel> urls, string folder)
        {
            HttpClient client = new HttpClient() { MaxResponseContentBufferSize = 1000000 };
            IEnumerable<Task> tasks = from url in urls select Download(url.Url, client, folder);
            Task[] taskarray = tasks.ToArray();
            Task.WaitAll(taskarray);
        }

        private async Task Download(string url, HttpClient client, string query)
        {
            try
            {
                client.GetByteArrayAsync(url).ContinueWith(t =>
                {
                    try
                    {
                        int name = Interlocked.Increment(ref ImageController.count);
                        File.WriteAllBytes(ImageController.Path + imagePath + query + "/" + name + ".jpg",
                            t.Result);
                    }
                    catch (Exception ex)
                    {
                        //TODO: log error
                        Console.WriteLine("fail1:" + ex.StackTrace);
                    }
                });
            }
            catch (Exception ex)
            {
                //TODO: log error
                Console.WriteLine("fail2:" + ex.StackTrace);
            }


        }

    }
}
