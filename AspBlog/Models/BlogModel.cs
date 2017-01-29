namespace AspBlog.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Data.Entity;

    public class BlogModelContext : DbContext
    {

        public BlogModelContext()
            : base("name=BlogModel")
        {
        }

        public DbSet<BlogPost> BlogPosts { get; set; }
        public DbSet<Tag> Tags { get; set; }
    }

    public class BlogPost
    {
        [Key]
        public int PostId { get; set; }
        public string Title { get; set; }
        public string Date { get; set; }
        public string Type { get; set; }
        public string MainImageID { get; set; }
        public string IntroText { get; set; }
        public string OutroText { get; set; }


        private ICollection<Ingredient> ingredients { get; set; }
        public ICollection<Ingredient> Ingredients
        {
            get { return ingredients ?? (ingredients = new List<Ingredient>()); }
            set { ingredients = value; }
        }

        private ICollection<Step> steps { get; set; }
        public ICollection<Step> Steps
        {
            get { return steps ?? (steps = new List<Step>()); }
            set { steps = value; }
        }

        private ICollection<Tag> tags;
        public ICollection<Tag> Tags
        {
            get { return tags ?? (tags = new List<Tag>()); }
            set { tags = value; }
        }
    }


    public class Tag
    {
        [Key]
        public int TagId { get; set; }
        public string TagName { get; set; }
        
    }

    public class Ingredient
    {
        [Key]
        public int IngredientId { get; set; }
        public string Name { get; set; }
        public string Amount { get; set; }
        
    }

    public class Step
    {
        [Key]
        public int StepId { get; set; }
        public string Text { get; set; }
        public string StepImageID { get; set; }
        
    }


}