namespace WebBuilder2014.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class wbtemplate1 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.WBTemplates",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Code = c.String(nullable: false, maxLength: 50),
                        Json = c.String(nullable: false, maxLength: 4000),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.WBTemplates");
        }
    }
}
