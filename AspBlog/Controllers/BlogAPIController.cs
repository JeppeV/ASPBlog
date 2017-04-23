﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using AspBlog.Models;
using System.Web.Script.Serialization;
using System.Data.Entity.Infrastructure;
using System.Data.Entity;
using System.Web;
using System.Threading.Tasks;
using System.IO;

namespace AspBlog.Controllers
{
    public class BlogAPIController : ApiController
    {


        [HttpGet]
        [ActionName("GetAllPosts")]
        public string GetAllPosts()
        {
            List<BlogPost> resultPosts;
            using (var context = new BlogModelContext())
            {
                resultPosts = getFullBlogPostQuery(context).ToList();

            }
            resultPosts = resultPosts.OrderByDescending(p => convertDateStringToDateTime(p.Date)).ToList();
            var jsonResponse = getJSON(resultPosts);
            return jsonResponse;
        }

        [HttpGet]
        [ActionName("GetPostsByType")]
        public string GetPostsByType(string type_json)
        {
            string type = new JavaScriptSerializer().Deserialize<string>(type_json);
            List<BlogPost> resultPosts = new List<BlogPost>();
            using(var context = new BlogModelContext())
            {
                foreach(BlogPost post in getFullBlogPostQuery(context))
                {
                    if(post.Type == type)
                    {
                        resultPosts.Add(post);
                    }
                }
            }
            resultPosts = resultPosts.OrderByDescending(p => convertDateStringToDateTime(p.Date)).ToList();
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
                        contains_all_tags &= post.Tags.Select(p => p.Text).Contains(search_tag);
                    }
                    if (contains_all_tags) resultPosts.Add(post);
                        
                }
            }
            resultPosts = resultPosts.OrderByDescending(p => convertDateStringToDateTime(p.Date)).ToList();
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
                var tempList = getFullBlogPostQuery(context).ToList().OrderByDescending(p => convertDateStringToDateTime(p.Date));
                resultPosts = tempList.Take(n).ToList();
            }
            var jsonResponse = getJSON(resultPosts);
            return jsonResponse;
        }

        [HttpGet]
        [ActionName("GetPostById")]
        public string GetPostById(int id)
        {
            BlogPost resultPost;
            using (var context = new BlogModelContext())
            {
                resultPost = getFullBlogPostQuery(context).FirstOrDefault(p => p.PostId == id);
            }
            var jsonResponse = getJSON(resultPost);
            return jsonResponse;
        }   

        [HttpGet]
        [ActionName("GetAllTags")]
        public string getAllTags()
        {
            List<string> resultTags;
            using (var context = new BlogModelContext())
            {
                var tags = context.Tags;
                resultTags = tags.Select(t => t.Text).Distinct().ToList();
            }
            var jsonResponse = getJSON(resultTags);
            return jsonResponse;
        }

        [HttpGet]
        [ActionName("GetAllTypes")]
        public string getAllTypes()
        {
            List<string> resultTypes;
            using (var context = new BlogModelContext())
            {
                var posts = context.BlogPosts;
                resultTypes = posts.Select(p => p.Type).Distinct().ToList();
            }
            var jsonResponse = getJSON(resultTypes);
            return jsonResponse;
        }

        
        [HttpPost]
        [ActionName("AddPost")]
        public async Task<string> Test()
        {
            if (!Request.Content.IsMimeMultipartContent())
                throw new Exception();

            var streamProvider = await Request.Content.ReadAsMultipartAsync(); // HERE
            BlogPost newPost = null;
            List<TempImageInfo> imageInfos = new List<TempImageInfo>();
            
            foreach (HttpContent data in streamProvider.Contents)
            {
                string formName = data.Headers.ContentDisposition.Name.Trim('\"');
                if (formName == "main_image")
                {
                    // main image
                    var imageInfo = new TempImageInfo();
                    imageInfo.ImageFilename = data.Headers.ContentDisposition.FileName.Trim('\"');
                    imageInfo.ImageData = await data.ReadAsByteArrayAsync();
                    imageInfo.IsMainImage = true;
                    imageInfos.Add(imageInfo);
                }
                else if(formName == "post_data")
                {
                    // post data
                    var jsonPost = await data.ReadAsStringAsync();
                    newPost = new JavaScriptSerializer().Deserialize<BlogPost>(jsonPost);
                }
                else
                {
                    // step image
                    var imageInfo = new TempImageInfo();
                    imageInfo.ImageContentName = formName;
                    imageInfo.ImageFilename = data.Headers.ContentDisposition.FileName.Trim('\"');
                    imageInfo.ImageData = await data.ReadAsByteArrayAsync();
                    imageInfo.IsMainImage = false;
                    imageInfos.Add(imageInfo);
                }
                
            }
            Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~") + @"Images\" + newPost.Title + @"\Steps");
            foreach(TempImageInfo imageInfo in imageInfos)
            {
                if (imageInfo.IsMainImage)
                {
                    newPost.MainImageID = saveImage(newPost, imageInfo);
                }
                else
                {
                    
                    var stepIndex = int.Parse(imageInfo.ImageContentName.Split('%')[1]);
                    
                    newPost.Steps.ElementAt(stepIndex).StepImageID = saveImage(newPost, imageInfo);
                }
            }
            
            using(var context = new BlogModelContext())
            {
                context.BlogPosts.Add(newPost);
                context.SaveChanges();
            }
            return "";

        }

        private class TempImageInfo
        {
            public string ImageContentName { get; set; }
            public string ImageFilename { get; set; }
            public byte[] ImageData { get; set; }
            public bool IsMainImage { get; set; }
        }        

        private string saveImage(BlogPost post, TempImageInfo imageInfo)
        {
            string imageID = generateImageID(post, imageInfo);
            string imagePath = HttpContext.Current.Server.MapPath("~") + @"Images\" + imageID;
            using(FileStream fs = new FileStream(imagePath, FileMode.OpenOrCreate))
            {
                fs.Write(imageInfo.ImageData, 0, imageInfo.ImageData.Length);
            }
            return imageID;
        }

        private string generateImageID(BlogPost post, TempImageInfo imageInfo)
        {
            string extension = Utility.getFileExtension(imageInfo.ImageFilename);
            if (imageInfo.IsMainImage)
            {
                return post.Title + @"\main." + extension;
            }
            else
            {
                var stepIndex = int.Parse(imageInfo.ImageContentName.Split('%')[1]);
                return post.Title + @"\Steps\step$" + stepIndex + "." + extension;
            }
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

        [HttpGet]
        [ActionName("GetContactInfo")]
        public string GetContactInfo()
        {
            var contact_info_path = HttpContext.Current.Server.MapPath("~") + @"Contact\contact_info.txt";
            var contactInfo = new ContactInfo();
            using (StreamReader sr = new StreamReader(contact_info_path))
            {
                contactInfo.Name = sr.ReadLine();
                contactInfo.Age = sr.ReadLine();
                contactInfo.Email = sr.ReadLine();
                contactInfo.Text = sr.ReadLine();
            }
            var jsonResponse = getJSON(contactInfo);
            return jsonResponse;
        }

        private class ContactInfo
        {
            public string Name { get; set; }
            public string Age { get; set; }
            public string Email { get; set; }
            public string Text { get; set; }
        }












    }


}
