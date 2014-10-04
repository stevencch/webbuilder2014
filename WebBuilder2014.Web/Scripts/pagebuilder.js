/*global*/
var uid = 0;

/*page load*/
$(function () {
    //pagebuilder
    $(".wb_sortable").sortable({
        revert: true,
        stop: function (event, ui) {
            ui.item.html('hello');
        }
    });
    //toolbox
    $("#wb_toolbox").draggable({ handle: ".title" });
    $("#wb_toolbox .accordion").accordion();
    $('.wb_draggable').draggable({
        connectToSortable: ".wb_sortable",
        helper: function() {
            return $('<p>###</p>');
        }
    });
});