using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebBuilder2014.Common.Entity;

namespace WebBuilder2014.DAL
{
    public class WBDbContext:DbContext
    {
        public DbSet<PageSection> PageSections { get; set; }

        public DbSet<WBPage> WBPages { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Ignore<System.Data.Entity.ModelConfiguration.Conventions.PluralizingTableNameConvention>();
        }
    }
}
