namespace WebBuilder2014.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class wbtemplate12 : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.WBTemplates", "Json", c => c.String(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.WBTemplates", "Json", c => c.String(nullable: false, maxLength: 4000));
        }
    }
}
