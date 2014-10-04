namespace WebBuilder2014.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class pagesection : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.PageSections",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Code = c.String(nullable: false, maxLength: 10),
                        Json = c.String(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.PageSections");
        }
    }
}
