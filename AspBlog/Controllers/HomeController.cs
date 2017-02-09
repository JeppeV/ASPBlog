using System.IO;
using System.Web.Mvc;
using System.Web.Helpers;
using System.Web.Script.Serialization;
using System.Collections.Generic;
using System.Web.Services;
using AspBlog.Models;
using System;

namespace AspBlog.Controllers
{
    public class HomeController : Controller
    {
        /* /Home/Index */
        public ActionResult Index()
        {
            return View("Index");
        }

        public ActionResult Admin()
        {
            return View("Admin");
        }
        
        /* /Home/Test */
        public ActionResult Test()
        {
            return View("Test");
        }

        /* TODO: Add input validation for safety */
        public ActionResult Image(string imageID)
        {
            string extension = Utility.getFileExtension(imageID);
            return File(pathToImage(imageID), "image/"+ extension);
        }

        private string pathToImage(string imageID)
        {
            return Server.MapPath("~") + @"Images\" + imageID;
        }

        




    }
}