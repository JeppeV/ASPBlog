using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AspBlog.Controllers
{
    public class AngularViewsController : Controller
    {
        // GET: AngularViews/List
        public ActionResult List()
        {
            return View("List");
        }

        // GET: AngularViews/Contact
        public ActionResult Contact()
        {
            return View("Contact");
        }

        // GET: AngularViews/Post
        public ActionResult Post()
        {
            return View("Post");
        }
    }
}