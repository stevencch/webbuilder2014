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
var currntTextList = null;
var currentEditText = null;
var currntImageList = null;
var currentEditImage = null;

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
        tinymce.init({
            selector: 'textarea#wb_textEditor',
            theme: "modern",
            width: 530,
            height: 300,
            plugins: [
                 "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
                 "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
                 "save table contextmenu directionality emoticons template paste textcolor"
            ],
            content_css: "css/content.css",
            toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | l      ink image | print preview media fullpage | forecolor backcolor emoticons",
            style_formats: [
                 { title: 'Bold text', inline: 'b' },
                 { title: 'Red text', inline: 'span', styles: { color: '#ff0000' } },
                 { title: 'Red header', block: 'h1', styles: { color: '#ff0000' } },
                 { title: 'Example 1', inline: 'span', classes: 'example1' },
                 { title: 'Example 2', inline: 'span', classes: 'example2' },
                 { title: 'Table styles' },
                 { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' }
            ]
        });
        $("#wb_EditTextModal").draggable({
            handle: ".modal-title"
        });
        $("#wb_EditImageModal").draggable({
            handle: ".modal-title"
        });
    };
    //########################################################################################################edit text
    $scope.editTextList = [];
    $scope.editText = function () {
        $scope.updateEditTextList();
        $('#wb_EditTextModal').modal({
            backdrop: false,
            show: true
        });
    }
    $scope.selectEditText = function (index) {
        //(window.console && console.log($scope.editTextList[index].text)) || alert($scope.editTextList[index].text);
        currentEditText=$(currntTextList[index]);
        tinymce.activeEditor.setContent(currentEditText.html());
    };
    $scope.saveEditText = function () {
        currentEditText.html(tinymce.activeEditor.getContent());
        $scope.updateEditTextList();
    }

    $scope.updateEditTextList = function () {
        currntTextList = currentNode.find("*[txtid]");
        $scope.editTextList = [];
        _.each(currntTextList, function (item) {
            $scope.editTextList.push({
                txtid: $(item).attr('txtid'),
                text: item.innerHTML.replace(/<[^>]*>/g, ' ').short(40)
            })
        });
    };
    //########################################################################################################edit image
    $scope.editImageList = [];
    $scope.editImage = function () {
        $scope.updateEditImageList();
        $('#wb_EditImageModal').modal({
            backdrop: false,
            show: true
        });
    }
    $scope.selectEditImage = function (index) {
        currentEditImage=$(currntImageList[index]);
        $('.editImageItem').removeClass('active');
        $('.editImageItem-' + index).addClass('active');
    };
    $scope.saveEditImage = function () {
        
        $scope.updateEditImageList();
    }

    $scope.updateEditImageList = function () {
        currntImageList = currentNode.find("*[imgid]");
        $scope.editImageList = [];
        _.each(currntImageList, function (item) {
            $scope.editImageList.push({
                imgid: $(item).attr('imgid'),
                image: $(item).attr('src'),
                width: item.width,
                height:item.height
            })
        });
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