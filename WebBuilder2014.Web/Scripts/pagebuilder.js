$(function () {
    //pagebuilder
    $(".wb_sortable").sortable({
        revert: true
    });
    //toolbox
    $("#wb_toolbox").draggable({ handle: ".title" });
    $("#wb_toolbox .accordion").accordion();
    $('#wb_toolbox .wb_draggable').draggable({
        connectToSortable: "#pagebuilder .wb_sortable",
        helper: "clone"
    }).disableSelection();
});