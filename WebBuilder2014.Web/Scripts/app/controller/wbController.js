/*########################################################################################################global function*/
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\xA0]+|[\s\xA0]+$/g, '');
    };
}

String.prototype.short = function (i) {
    if (this.length < i) {
        i = this.length;
    }
    return this.substr(0, i);
};
/*########################################################################################################global variable*/
var uid = 0;
var currentSection = null;
var tempContent = '';
var currentNode = null;


wbApp.controller('wbController', function ($scope) {
    //########################################################################################################init
    $scope.afterRender = function () {
        //pagebuilder
        $(".wb_sortable").sortable({
            revert: true,
            placeholder: "ui-state-placeholder",
            stop: $scope.sortableStop
        });
        $('#wb_pagebuilder').delegate('.wb_draggable', 'click', function () {
            currentNode = $(this);
            $('.selectedNode').removeClass('selectedNode');
            currentNode.addClass("selectedNode");
        });


        //toolbox
        $("#wb_toolbox").draggable({ handle: ".title" });
        $("#wb_toolbox .accordion").accordion();
        $('.wb_draggable').draggable({
            connectToSortable: ".wb_sortable",
            helper: "clone"
        });

        //modal
        $("#wb_EditTextModal").draggable({
            handle: ".modal-title"
        });
    };
    //########################################################################################################edit text
    $scope.editTextList = [];
    $scope.editText = function () {
        var textList = currentNode.find("*[txtid]");
        $scope.editTextList = [];
        _.each(textList, function (item) {
            $scope.editTextList.push({
                txtid: $(item).attr('txtid'),
                text: item.innerHTML.replace(/<[^>]*>/g, '').short(40)
            })
        });
        $('#wb_EditTextModal').modal({
            backdrop: false,
            show: true
        });
    }
    $scope.selectEditText = function (editText) {
        window.console && console.log(editText.text) || alert(editText.text);
    };

    /*########################################################################################################helper function*/
    $scope.getHtml=function(node) {
        if (node.Type != '#text') {
            tempContent += '<' + node.Type;
            if (node.Attributes) {
                tempContent += ' ';
                for (var j = 0; j < node.Attributes.length; j++) {
                    tempContent += node.Attributes[j].Key + '="' + node.Attributes[j].Value + '" ';
                }
            }
            tempContent += '>';
            if (node.Children) {
                for (var j = 0; j < node.Children.length; j++) {
                    $scope.getHtml(node.Children[j]);
                }
            }
            tempContent += '</' + node.Type + '>';
        }
        else {
            tempContent += node.Content;
        }
    }

    $scope.triggerJs=function (code) {
        switch (code) {
            case 's0101':
                $('[data-hover="dropdown"]').dropdownHover();
                break;
            case 's0102':
                $('#da-slider').cslider();
                break;
            case 's0108':
                $('#clients-flexslider').flexslider({
                    animation: "slide",
                    easing: "swing",
                    animationLoop: true,
                    itemWidth: 1,
                    itemMargin: 1,
                    minItems: 2,
                    maxItems: 9,
                    controlNav: false,
                    directionNav: false,
                    move: 2
                });
                break;
        }
    }

    $scope.sortableStop=function (event, ui) {
        currentSection = ui.item;
        $.get("/api/page/" + currentSection.attr('sid'), function (data) {
            tempContent = '';
            $scope.getHtml(data);
            currentSection.html(tempContent);
            $scope.triggerJs(currentSection.attr('sid'));
            //layout
            currentSection.find('.wb_sortable').sortable({
                revert: true,
                placeholder: "ui-state-placeholder",
                stop: $scope.sortableStop
            });

        }).fail(function () {
            alert('fail');
        });
    }
});