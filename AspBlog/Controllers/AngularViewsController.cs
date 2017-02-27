using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AspBlog.Controllers
{
    public class AngularViewsController : Controller
    {
        // GET: AngularViews
        public ActionResult List()
        {
            return View("List");
        }

        public ActionResult Contact()
        {
            return View("Contact");
        }

        public ActionResult Post()
        {
            return View("Post");
        }
    }
}