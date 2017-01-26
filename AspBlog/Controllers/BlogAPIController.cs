using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AspBlog.Models;
using Newtonsoft.Json.Linq;
using System.Web.Script.Serialization;
using System.Data.Entity.Infrastructure;
using System.Data.Entity;
using System.Web;
using System.Threading.Tasks;
using System.Collections.ObjectModel;
using System.IO;

namespace AspBlog.Controllers
{
    public class BlogAPIController : ApiController
    {

        [HttpPost]
        [ActionName("AddPost")]
        public string AddPost(BlogPost post_data)
        {
            List<BlogPost> resultPosts;
            using (var context = new BlogModelContext())
            {
                context.BlogPosts.Add(post_data);
                context.SaveChanges();
                resultPosts = getFullBlogPostQuery(context).ToList();
            }
            var jsonResponse = getJSON(resultPosts);
            return jsonResponse;
        }

        [HttpGet]
        [ActionName("GetAllPosts")]
        public string GetAllPosts()
        {
            List<BlogPost> resultPosts;
            using(var context = new BlogModelContext())
            {
                resultPosts = getFullBlogPostQuery(context).ToList();
                
            }
            var jsonResponse = getJSON(resultPosts);
            return jsonResponse;
        }

        

        [HttpGet]
        [ActionName("GetPostsByTags")]
        public string GetPostsByTags(string search_tags_json)
        {
            string[] search_tags = new JavaScriptSerializer().Deserialize<string[]>(search_tags_json);
            List<BlogPost> resultPosts = new List<BlogPost>();
            using(var context = new BlogModelContext())
            {
                foreach(BlogPost post in getFullBlogPostQuery(context))
                {
                    var contains_all_tags = true;
                    foreach (string search_tag in search_tags)
                    {
                        contains_all_tags &= post.Tags.Select(p => p.TagName).Contains(search_tag);
                    }
                    if (contains_all_tags) resultPosts.Add(post);
                        
                }
            }
            var jsonResponse = getJSON(resultPosts);
            return jsonResponse;
        }

        [HttpGet]
        [ActionName("GetLastNPosts")]
        public string GetLastNPosts(int n)
        {
            
            List<BlogPost> resultPosts;
            using (var context = new BlogModelContext())
            {
                var tempList = getFullBlogPostQuery(context).ToList().OrderBy(p => convertDateStringToDateTime(p.Date));
                resultPosts = tempList.Take(n).ToList();
            }
            var jsonResponse = getJSON(resultPosts);
            return jsonResponse;
        }

        //REQUIRES TESTING
        [HttpGet]
        [ActionName("GetPostById")]
        public string GetPostById(int id)
        {
            BlogPost resultPost;
            using (var context = new BlogModelContext())
            {
                resultPost = context.BlogPosts.Find(id);
            }
            var jsonResponse = getJSON(resultPost);
            return jsonResponse;
        }   

        [HttpGet]
        [ActionName("GetAllTags")]
        public string getAllTags()
        {
            List<Tag> resultTags;
            using (var context = new BlogModelContext())
            {
                resultTags = context.Tags.ToList();
            }
            var jsonResponse = getJSON(resultTags);
            return jsonResponse;
        }

        /*
         * Change to become AddPost
         * Insert img byte array into post
         */
        [HttpPost]
        [ActionName("Test")]
        public async Task<string> Test()
        {
            if (!Request.Content.IsMimeMultipartContent())
                throw new Exception();

            var streamProvider = await Request.Content.ReadAsMultipartAsync(); // HERE
            BlogPost newPost = null;
            string newImageID = null;
            foreach (var data in streamProvider.Contents)
            {
                string formName = data.Headers.ContentDisposition.Name.Trim('\"');
                if (formName == "main_image")
                {
                    
                    byte[] image_data = await data.ReadAsByteArrayAsync();
                    
                    newImageID = saveImage(data.Headers.ContentDisposition.FileName.Trim('\"'), image_data);

                }
                else if(formName == "post_data")
                {
                    var jsonPost = await data.ReadAsStringAsync();
                    newPost = new JavaScriptSerializer().Deserialize<BlogPost>(jsonPost);
                }
                
            }
            newPost.ImageID = newImageID;
            using(var context = new BlogModelContext())
            {
                context.BlogPosts.Add(newPost);
                context.SaveChanges();
            }
            return "";

        }

        private string saveImage(string filename, byte[] image_data)
        {
            string[] tokens = filename.Split('.');
            string ext = tokens[tokens.Length - 1];
            string imageID = "0." + ext;
            string imagePath = HttpContext.Current.Server.MapPath("~") + @"Images\" + imageID;
            using(FileStream fs = new FileStream(imagePath, FileMode.OpenOrCreate))
            {
                fs.Write(image_data, 0, image_data.Length);
            }
            return imageID;
        }

        


        private DateTime convertDateStringToDateTime(string dateString)
        {
            DateTime result = Convert.ToDateTime(dateString);
            return result;
        }

        

        private string getJSON(object o)
        {
            var serializer = new JavaScriptSerializer();
            return serializer.Serialize(o);
        }

        private DbQuery<BlogPost> getFullBlogPostQuery(BlogModelContext context)
        {
            return context.BlogPosts.Include("Ingredients").Include("Steps").Include("Tags");
        }

        

        

        

        
        

        
    }


}
