/// <reference path="../../linq-vsdoc.js" />


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


wbApp.controller('wbController', function ($scope, $timeout) {
    //########################################################################################################variables
    $scope.tempContent = '';
    $scope.currentNode = null;
    $scope.currntTextList = null;
    $scope.currentEditText = null;
    $scope.currntImageList = null;
    $scope.currentImageNode = null;
    $scope.currentEditImage = null;
    $scope.currentSelectedImage = null;

    $scope.imageLoadStep = 0;
    $scope.imageLoadStepTry = 3;
    $scope.imageLoadCount = 50;
    $scope.imageUrl = [];
    $scope.imageLoad = [];
    $scope.selectedSearchImage = null;
    $scope.selectedMyFolderImage = null;

    $scope.currntIconList = null;
    $scope.currentIconNode = null;
    $scope.currentEditIcon = null;
    $scope.currentSelectedIcon = null;
    $scope.selectedMyIcon = null;

    //########################################################################################################global
    $scope.defaultRootNode = defaultRootNode;
    $scope.rootNode = $scope.defaultRootNode;

    $scope.currentJsonNode = null;
    $scope.isFound = false;


    //########################################################################################################page resources
    $scope.fontfaces = fontfaces;

    $scope.iconList1 = iconList1;
    $scope.iconList2 = iconList2;

    $scope.templateList = templateList;


    //########################################################################################################page function
    $scope.newPageName = '';
    $scope.isLoadTemplate = false;
    $scope.loadPageList = [];
    $scope.newPage = function () {
        $('#wb_designPanel').hide();
        $('#wb_NewPageModal').modal({
            backdrop: false,
            show: true
        });
    };

    $scope.selectTemplate = function (index) {
        $('.wb-template').removeClass('active');
        $('.wb-template-' + index).addClass('active');
        $scope.isLoadTemplate = false;
        var templateId = $scope.templateList[index].code;
        $.get("/api/template/" + templateId, function (data) {
            $scope.rootNode = data;
            $scope.isLoadTemplate = true;
            $scope.$apply();

        }).fail(function () {
            alert('fail');
        });
    }

    $scope.creatNewPage = function () {
        $('#wb_NewPageModal').modal('hide');
        $scope.rootNode.Content = $scope.newPageName;
        $scope.loadPage($scope.rootNode);
        $('#wb_designPanel').show();
    };


    $scope.openPage = function () {
        $('#wb_designPanel').hide();
        $.get("/api/page", function (data) {
            _.each(data, function(item) {
                $scope.loadPageList.push(item.replace(/_/g, ' '))
            });
            $scope.$apply();
            $('#wb_LoadPageModal').modal({
                backdrop: false,
                show: true
            });

        }).fail(function () {
            alert('fail');
        });
    };
    
    $scope.loadMyPage = function (index) {
        var pageName = $scope.loadPageList[index].replace(/ /g, '_');
        $.get("/api/page/"+pageName, function (data) {
            $scope.loadPage(data);
            $('#wb_LoadPageModal').modal('hide');
            $('#wb_designPanel').show();
        }).fail(function () {
            alert('fail');
        });
    }

    $scope.loadPage = function (data) {
        $scope.tempContent = '';
        $scope.rootNode = data;
        $scope.getHtml(data);
        $('#htmlRoot').html($scope.tempContent);
        $('.wb_droppable').droppable({
            accept: ":not(.ui-sortable-helper)",
            drop: $scope.droppableDrop
        });
        $(".wb_sortable").sortable({
            revert: true,
            placeholder: "ui-state-placeholder",
            stop: $scope.sortableStop
        });
        var sectionids = _.map($('*[sectionid]'), function (item) {
            return $(item).attr('sectionid');
        });
        var sectionidset = _.uniq(sectionids);
        _.each(sectionidset, function (item) {
            $scope.triggerJs(item);
        });

        $(".emptyCol").append($('<div class="wb_placeholder"><span>Drag Item Here</span></div>'));
    }

    $scope.savePage = function () {
        $scope.reorderNode($scope.rootNode);
        $.ajax({
            type: 'POST',
            dataType: "json",
            url: '/api/page',
            data: JSON.stringify($scope.rootNode),
            contentType: "application/json; charset=utf-8"
        }).done(function () {
            alert('saved');
        }).fail(function () {
            alert('fail');
        });
    };

    $scope.reorderNode = function (node) {
        if (node.Children.length > 1) {
            var attribute = $scope.getAttribute(node, 'wb_id');
            var children = $('*[wb_id="' + attribute.Value + '"]').find('*[wb_id]');
            if (children.length > 0) {
                var orderChildren = [];
                for (var i = 0; i < children.length; i++) {
                    orderChildren.push(
                        {
                            wd_id: $(children[i]).attr('wb_id'),
                            order: i
                        }
                    );
                }
                var newOrder = _.sortBy(node.Children, function (item) {
                    var order = _.find(orderChildren, function (c) {
                        var result = c.wd_id == $scope.getAttribute(item, 'wb_id').Value;
                        return result;
                    }).order;
                    return order;
                });

                node.Children = newOrder;
            }
        }

    };



    //########################################################################################################init
    $scope.afterRender = function () {
        $(document).on('focusin', function (e) {
            if ($(e.target).closest(".mce-window").length) {
                e.stopImmediatePropagation();
            }
        });

        //pagebuilder
        $('#htmlRoot').on('mouseenter', function (e) {
            $(this).addClass('mouseOn');
        });
        $('#htmlRoot').on('mouseleave', function (e) {
            $(this).removeClass('mouseOn');
            $('.mouseOverNode').removeClass('mouseOverNode');
        });
        $('#wb_pagebuilder').delegate('.wb_node', 'mouseover', function (e) {
            $scope.mouseOverNode(e, this);
        });
        $('#wb_pagebuilder').delegate('.wb_node', 'click', function (e) {
            $scope.selectNode(e, this);
        });


        //toolbox
        $("#wb_toolbox").draggable({ handle: ".title" });
        $("#wb_toolbox .accordion").accordion();
        $('.wb_draggable').draggable({
            helper: $scope.getDraggableHelper,
            cursor: "move",
            opacity: 0.4,
            refreshPositions: true,
            snap: true,
            appendTo: document.body,
            start: function (event, ui) {
                $('.wb_sortable').addClass('bigGap');
            },
            stop: function (event, ui) {
                $('.wb_sortable').removeClass('showTopBottom');
                $('.wb_sortable').removeClass('bigGap');
            },
            drag: function (event, ui) {
                $('.wb_sortable').removeClass('showTopBottom');
                $('.ui-state-placeholder').parent().addClass('showTopBottom');
            }

        });

        $('.wb_droppable').droppable({
            accept: ":not(.ui-sortable-helper)",
            drop: $scope.droppableDrop
        });

        //modal
        tinymce.init({
            selector: 'textarea#wb_textEditor',
            theme: "modern",
            width: 530,
            height: 300,
            menubar: false,
            plugins: [
                 "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
                 "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
                 "save table contextmenu directionality emoticons template paste textcolor"
            ],
            paste_as_text: true,
            font_formats: $scope.getFontfaceForTinymce(),
            content_css: "/Content/tinymce.css",
            toolbar: "undo redo pastetext | cut copy paste |styleselect fontselect fontsizeselect | forecolor backcolor bold italic charmap | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent subscript superscript | link image media | table code",
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
        $("#wb_SettingsModal").draggable({
            handle: ".modal-title"
        });

        $('#myFolderTab').on('shown.bs.tab', $scope.showMyFolder);
        $('#searchTab').on('shown.bs.tab', $scope.showSearchTab);
        $('#uploadTab').on('shown.bs.tab', $scope.showUploadTab);

        $scope.getFontfaceStyle();

        //model buttons
        $('#wb_pagebuilder').delegate('.btnEditText', 'click', function (e) {
            $scope.editText();
        });
        $('#wb_pagebuilder').delegate('.btnEditImage', 'click', function (e) {
            $scope.editImage();
        });
        $('#wb_pagebuilder').delegate('.btnEditSettings', 'click', function (e) {
            $scope.editSettings();
        });
        $('#wb_pagebuilder').delegate('.btnEditIcon', 'click', function (e) {
            $scope.editIcon();
        });
        $('#wb_pagebuilder').delegate('.btnDeleteModel', 'click', function (e) {
            $scope.deleteModel();
        });
        
    };

    $scope.getFontfaceStyle = function () {
        var style = [];
        _.each($scope.fontfaces, function (ff) {
            style.push('.' + ff.className + '{font-family:' + ff.fontFamily + ';}')
        });
        $('#wb_fontfacestyle').html(style.join(''));
    }

    $scope.getFontfaceForTinymce = function () {
        var fontList = '';
        for (var i = 0; i < $scope.fontfaces.length; i++) {
            fontList += $scope.fontfaces[i].name + '=' + $scope.fontfaces[i].fontFamily;
            if (i != $scope.fontfaces.length - 1) {
                fontList += ';';
            }
        }
        return fontList;
    };

    $scope.getDraggableHelper = function () {
        return $('<i class="icon-file-text"></i>');
    };

    $scope.droppableDrop = function (event, ui) {
        $scope.currentNode = ui.draggable;
        $scope.searchNode($scope.rootNode, 'wb_id', $(this).attr('wb_id'), true);
        if ($scope.currentNode.attr('sid')) {
            $(this).html('<h2 class="modelLoading">Loading...</h2>');
            $.get("/api/section/" + $scope.currentNode.attr('sid'), function (data) {
                $scope.fillUUID(data);
                $scope.currentNode.attr('wb_id', $scope.getAttribute(data, 'wb_id').Value);
                $scope.currentJsonNode.Children.push(data);
                $scope.reorderNode($scope.currentJsonNode)
                $scope.loadPage($scope.rootNode);
            }).fail(function () {
                alert('fail');
            });
        } else {
            $scope.reorderNode($scope.currentJsonNode)
            $scope.loadPage($scope.rootNode);
        }
    };

    $scope.sortableStop = function (event, ui) {
        $scope.currentNode = ui.item;
        $scope.searchNode($scope.rootNode, 'wb_id', $scope.currentNode.parent().attr('wb_id'), true);
        $scope.reorderNode($scope.currentJsonNode);
        $scope.loadPage($scope.rootNode);
    };

    $scope.mouseOverNode = function (e, item) {
        $('.mouseOverNode').removeClass('mouseOverNode');
        $(item).addClass("mouseOverNode");
        e.stopPropagation();
    };


    $scope.selectNode = function (e, item) {
        $scope.currentNode = $(item);
        $('.selectedNode').removeClass('selectedNode');
        $scope.currentNode.addClass("selectedNode");
        $scope.searchNode($scope.rootNode, 'wb_id', $scope.currentNode.attr('wb_id'), true);
        $('#wb_pagebuilder .modelButtons').remove();
        $scope.currentNode.append($('#hiddenModel .modelButtons').clone());
        e.stopPropagation();
    };

    $scope.generateUUID = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    };

    $scope.fillUUID = function(node) {
        var list = ['wb_id', 'txtid', 'imgid', 'iconid'];
        _.each(list, function(item) {
            var attr = $scope.getAttribute(node, item);
            if (attr) {
                attr.Value = $scope.generateUUID();
            }
        });
        _.each(node.Children, function(item) {
            $scope.fillUUID(item);
        });
    };
    
    $scope.deleteModel = function () {
        $scope.removeNode($scope.rootNode, 'wb_id', $scope.currentNode.attr('wb_id'), true);
        $scope.currentNode.remove();
        $scope.loadPage($scope.rootNode);
    }
    //########################################################################################################edit text
    $scope.editTextList = [];
    $scope.editText = function () {
        $scope.updateEditTextList();
        $scope.$apply();
        $('#wb_EditTextModal').modal({
            backdrop: false,
            show: true
        });
    }
    $scope.selectEditText = function (index) {
        _.each($scope.editTextList, function (item) {
            item.isActive = false;
        });
        $scope.editTextList[index].isActive = true;
        $scope.currentEditText = $($scope.currntTextList[index]);
        var html = $scope.addPTag($scope.currentEditText.html());
        tinymce.activeEditor.setContent(html);
    };
    $scope.saveEditText = function () {
        var html = $scope.removePTag(tinymce.activeEditor.getContent());
        $scope.currentEditText.html(html);
        $scope.searchNode($scope.rootNode, 'txtid', $scope.currentEditText.attr('txtid'), true);
        $scope.currentJsonNode.Children[0].Content = html;
        $scope.updateEditTextList();
    }

    $scope.updateEditTextList = function () {
        $scope.currntTextList = $scope.currentNode.find("*[txtid]");
        $scope.editTextList = [];
        _.each($scope.currntTextList, function (item) {
            $scope.editTextList.push({
                txtid: $(item).attr('txtid'),
                text: item.innerHTML.replace(/<[^>]*>/g, ' ').short(40)
            });
        });
        $scope.selectEditText(0);
    };

    $scope.removePTag = function (html) {
        var result = html.replace(/<p>/g, '<br/>').replace(/<\/p>/g, '').replace('<br/>', '');
        return result;
    }

    $scope.addPTag = function (html) {
        var result = '<p>' + html.replace(/<br\/>/g, '</p>\n<p>').replace(/<br>/g, '</p>\n<p>') + '</p>';
        return result;
    }

    //########################################################################################################edit image
    $scope.isTempImageSelected = false;
    $scope.isMyFolderImageSelected = false;
    $scope.cropwidth = 0;
    $scope.cropheight = 0;
    $scope.editImageList = [];
    $scope.searchImageList = [];
    $scope.myfolderImageList = [];
    $scope.editImage = function () {
        $scope.updateEditImageList();
        if ($scope.editImageList.length) {
            $('#wb_EditImageModal').modal({
                backdrop: false,
                show: true
            });
            $scope.$apply();
            $scope.selectEditImage(0);
        }
    };

    $scope.updateEditImageList = function () {
        $scope.currntImageList = $scope.currentNode.find("*[imgid]");
        $scope.editImageList = [];
        _.each($scope.currntImageList, function (item) {
            $scope.editImageList.push({
                imgid: $(item).attr('imgid'),
                image: $(item).attr('src'),
                width: item.width,
                height: item.height
            })
        });
    };

    $scope.selectEditImage = function (index) {
        $scope.currentImageNode = $($scope.currntImageList[index]);
        $scope.currentEditImage = $scope.editImageList[index];
        $('.editImageItem').removeClass('active');
        $('.editImageItem-' + index).addClass('active');
        $scope.cropwidth = $scope.currentEditImage.width;
        $scope.cropheight = $scope.currentEditImage.height;
    };


    $scope.searchImage = function (page) {
        $scope.currentSelectedImage = null;
        $('#btnSearch').html("Loading...");
        $('#searchPanel .content').hide();
        $.get('/api/image?query=' + $('#textSearch').val() + '&filter=size:large&top=50&skip=' + (page * 50),
            function (data) {
                var count = 0;
                _.each(data, function (item) {
                    $scope.imageUrl[count] = item.Url;
                    count++;
                });
                $scope.searchImageList = data;
                $scope.$apply();
                $scope.imageLoadStep = 0;
                setTimeout(loadImage, 3000);
            })
            .fail(function () {
                alert('fail');
            });
    }

    function loadImage() {
        $scope.imageLoadStep++;
        var allPass = true;
        for (var i = 0; i < $scope.imageLoadCount; i++) {
            if ($scope.imageUrl[i] != null) {
                $scope.imageLoad[i] = new Image();
                $scope.imageLoad[i].onerror = hideImage(i);
                $scope.imageLoad[i].onload = showImage(i);
                $scope.imageLoad[i].alt = $scope.imageUrl[i].replace('/content/image_folder/', '').replace('/', '_');
                $scope.imageLoad[i].src = $scope.imageUrl[i];
                allPass = false;
            }
        }
        if (!allPass && $scope.imageLoadStep <= $scope.imageLoadStepTry) {
            window.console && console.log($scope.imageLoadStep);
            setTimeout(loadImage, 3000);
        } else {
            $('#btnSearch').html('Search');
            var itemCount = 0;
            _.each($('#searchPanel .wb_searchImage'), function (item) {
                if (!$(item).hasClass('hidden')) {
                    itemCount++;
                    if (itemCount > 0 && itemCount % 4 == 0) {
                        $(item).after($('<div class="clearfix"></div>'));
                    }
                }
            });
            $('#searchPanel .content').show();
        }
    }

    function hideImage(id) {
        window.console && console.log('hide ' + id);
        return function () {
            removeImage(id);
        };
    }

    function removeImage(id) {
        $('.wb_searchImage-' + id).addClass('hidden');
    }

    function showImage(id) {
        window.console && console.log('Load ' + id);
        return function () {
            displayImage(id);
        };
    }

    function displayImage(id) {
        window.console && console.log('display ' + id);
        $('.wb_searchImage-' + id + ' .imagePlaceHolder').append($scope.imageLoad[id]);
        $scope.imageUrl[id] = null;
    }

    $scope.selectSearchImage = function (index) {
        $('.wb_searchImage').removeClass('selected');
        $('.wb_searchImage-' + index).addClass('selected');
        $scope.selectedSearchImage = $scope.searchImageList[index];
        $scope.isTempImageSelected = true;
    };


    $scope.cropImage = function () {
        $('#wb_EditImageModal').modal('hide');
        $('#wb_CropImage').attr('src', $scope.selectedSearchImage.Url);
        $('#wb_CropImageModal .modal-dialog').width((parseInt($scope.cropwidth) + 50) + 'px');
        $('#wb_CropImageModal').modal({
            backdrop: false,
            show: true
        });
        cropdata = '';
        $('#wb_CropImage').cropbox({ width: $scope.cropwidth, height: $scope.cropheight, showControls: 'auto' })
            .on('cropbox', function (event, results, img) {
                $('.cropX').text(results.cropX);
                $('.cropY').text(results.cropY);
                $('.cropW').text(results.cropW);
                $('.cropH').text(results.cropH);
                cropdata = img.getDataURL();
            });
    }

    $scope.saveCropImage = function () {
        $('#btnSaveCropImage').html('Saving...');
        if (cropdata) {
            var imageData = {
                Name: $scope.selectedSearchImage.Name,
                Data: cropdata
            }
            $.ajax({
                type: 'POST',
                dataType: "json",
                url: '/api/image/save',
                data: JSON.stringify(imageData),
                contentType: "application/json; charset=utf-8"
            }).done(function () {
                $('#wb_CropImageModal').modal('hide');
                $('#wb_EditImageModal').modal({
                    backdrop: false,
                    show: true
                });
                $('#myFolderTab').tab('show');
                $scope.showMyFolder();
                $('#btnSaveCropImage').html('Save To My Folder');
            }).fail(function () {
                alert('fail');
                $('#btnSaveCropImage').html('Save To My Folder');
            });
        }
        else {
            alert('please crop the image.');
        }
    }

    $scope.uploadImage = function () {
        $('#btnUpload').html("");
        $('#btnUpload').html("Uploading...");
        var formData = new FormData();
        var opmlFile = $('#fileUpload')[0];
        formData.append("uploadFile", opmlFile.files[0]);
        $.ajax({
            url: '/api/image',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done(function (data) {
            $('#btnUpload').html("Upload");
            $scope.selectedSearchImage = {
                Name: data[0].Name,
                Url: data[0].Url
            };
            $scope.isTempImageSelected = true;
            $('#uploadPanel').html('<div class="uploadImage"><img src="' + data[0].Url + '"/></div><div class="imageSize">' + data[0].Width + ' X ' + data[0].Height + '</div>');
        }).fail(function () {
            alert('fail');
            $('#btnUpload').html("Upload");
        });
    }

    $scope.showMyFolder = function () {
        $scope.isTempImageSelected = false;
        $scope.isMyFolderImageSelected = false;
        $scope.$apply();
        $.get('/api/image/1',
            function (data) {
                $scope.myfolderImageList = data;
                $scope.$apply();
            })
            .fail(function () {
                alert('fail');
            });
    }

    $scope.showSearchTab = function () {
        $('.wb_searchImage').removeClass('selected');
        $scope.selectedSearchImage = null;
        $scope.isTempImageSelected = false;
        $scope.isMyFolderImageSelected = false;
        $scope.$apply();
    }

    $scope.showUploadTab = function () {
        $scope.isTempImageSelected = false;
        $scope.isMyFolderImageSelected = false;
        $scope.$apply();
    }

    $scope.selectMyFolderImage = function (index) {
        $('.wb_MyFolderImage').removeClass('selected');
        $('.wb_MyFolderImage-' + index).addClass('selected');
        $scope.selectedMyFolderImage = $scope.myfolderImageList[index];
        $scope.isMyFolderImageSelected = true;
    };

    //save to my folder
    $scope.saveImage = function () {
        $.ajax({
            type: 'POST',
            dataType: "json",
            url: '/api/image/move',
            data: JSON.stringify({ String1: $scope.selectedSearchImage.Url }),
            contentType: "application/json; charset=utf-8"
        }).done(function () {
            $('#myFolderTab').tab('show');
            $scope.showMyFolder();
        }).fail(function () {
            alert('fail');
        });
    }

    $scope.updateImage = function () {
        $scope.currentImageNode.attr('src', $scope.selectedMyFolderImage.Url);
        $scope.updateEditImageList();
        $scope.searchNode($scope.rootNode, 'imgid', $scope.currentImageNode.attr('imgid'), true);
        _.each($scope.currentJsonNode.Attributes, function (item) {
            if (item.Key == 'src') {
                item.Value = $scope.selectedMyFolderImage.Url;
            }
        });
    };
    //########################################################################################################edit icon
    $scope.isIconSelected = false;
    $scope.editIconList = [];

    $scope.editIcon = function () {
        $scope.updateEditIconList();
        if ($scope.editIconList.length) {
            $('#wb_EditIconModal').modal({
                backdrop: false,
                show: true
            });
            $scope.$apply();
            $scope.selectEditIcon(0);
        }
    };

    $scope.updateEditIconList = function () {
        $scope.currntIconList = $scope.currentNode.find("*[iconid]");
        $scope.editIconList = [];
        _.each($scope.currntIconList, function (item) {
            $scope.editIconList.push($(item).attr('class'));
        });
    };

    $scope.selectEditIcon = function (index) {
        $scope.currentIconNode = $($scope.currntIconList[index]);
        $scope.currentEditIcon = $scope.editIconList[index];
        $('.editIconItem').removeClass('active');
        $('.editIconItem-' + index).addClass('active');
    };

    $scope.selectMyIcon = function (index, list) {
        $('.wb_myIcon').removeClass('selected');
        $('.wb_myIcon-' + index).addClass('selected');
        switch (list) {
            case 1:
                $scope.selectedMyIcon = $scope.iconList1[index];
                break;
            case 2:
                $scope.selectedMyIcon = $scope.iconList2[index];
                break;
        }

        $scope.isIconSelected = true;
    };

    $scope.updateIcon = function () {
        $scope.currentIconNode.attr('class', $scope.selectedMyIcon);
        $scope.updateEditIconList();
        $scope.searchNode($scope.rootNode, 'iconid', $scope.currentIconNode.attr('iconid'), true);
        _.each($scope.currentJsonNode.Attributes, function (item) {
            if (item.Key == 'class') {
                item.Value = $scope.selectedMyIcon;
            }
        });
    }
    //########################################################################################################edit settings
    $scope.modelSettings = [];
    $scope.editSettings = function () {
        $scope.updateSettingsList();
        $('#wb_SettingsModal').modal({
            backdrop: false,
            show: true
        });
        $scope.$apply();
        $timeout($scope.initSettingForm, 0);
    };

    $scope.updateSettingsList = function () {
        $scope.modelSettings = [];
        $scope.findAllSettings($scope.currentJsonNode);
    }

    $scope.findAllSettings = function (node) {
        if (node.Settings && node.Settings.length > 0) {
            _.each(node.Settings, function (item) {
                $scope.modelSettings.push(item);
            });
        }
        if (node != $scope.currentJsonNode) {
            var wd_id = _.find(node.Children, function (item) {
                return item.Value == 'wb_id';
            });
            if (wd_id) {
                return;
            }
        }
        if (node.Children && node.Children.length > 0) {
            _.each(node.Children, function (item) {
                $scope.findAllSettings(item);
            });
        }
    }

    $scope.saveSettings = function () {
        var settings = $('#settingsForm input');
        for (var i = 0; i < settings.length; i++) {
            $scope.modelSettings[i].Value = $(settings[i]).val();
        }
        $('#wb_SettingsModal').modal('hide');
        $scope.loadPage($scope.rootNode);
    }

    $scope.initSettingForm = function () {
        var settings = $('#settingsForm input');
        for (var i = 0; i < settings.length; i++) {
            if ($(settings[i]).attr('wb_desc').toLowerCase().indexOf('color') >= 0) {
                $(settings[i]).minicolors();
            }
        }
    }

    /*########################################################################################################helper function*/
    $scope.isNewUUID = false;
    $scope.getHtml = function (node, parent) {
        if (node.Type != '#text') {
            $scope.tempContent += '<' + node.Type;
            var wb_settings = node.Settings;
            //repeat
            var wb_settings_repeat = null;
            if (wb_settings && wb_settings.length > 0) {
                wb_settings_repeat = _.find(wb_settings, function (item) {
                    return item.Type == 'repeat';
                });
            }

            //
            if (node.Attributes) {
                $scope.tempContent += ' ';
                for (var j = 0; j < node.Attributes.length; j++) {
                    //uuid
                    if ($scope.isNewUUID && (node.Attributes[j].Key == 'wb_id' || node.Attributes[j].Key == 'txtid' || node.Attributes[j].Key == 'imgid' || node.Attributes[j].Key == 'iconid')) {
                        node.Attributes[j].Value = $scope.generateUUID();
                    }
                    //emptycol
                    if (node.Attributes[j].Key == 'class') {
                        if (node.Attributes[j].Value.indexOf('col-') >= 0) {
                            if (node.Children && node.Children.length == 0) {
                                if (node.Attributes[j].Value.indexOf('emptyCol') < 0) {
                                    node.Attributes[j].Value += ' emptyCol';
                                }
                            } else {
                                if (node.Attributes[j].Value.indexOf('emptyCol') >= 0) {
                                    node.Attributes[j].Value = node.Attributes[j].Value.replace('emptyCol', '');
                                }
                            }
                        }
                    }
                    //
                    $scope.tempContent += node.Attributes[j].Key + '="' + node.Attributes[j].Value + '" ';
                }
            }
            $scope.tempContent += '>';
            if (node.Children && node.Children.length > 0) {
                //repeat
                if (wb_settings_repeat) {
                    var i = node.Children.length;
                    var k = 0;
                    for (var j = 0; j < parseInt(wb_settings_repeat.Value) ; j++) {
                        $scope.getHtml(node.Children[k], node);
                        k++;
                        if (k >= i) {
                            k = 0;
                            $scope.isNewUUID = true;
                        }
                    }
                    $scope.isNewUUID = false;
                } else {
                    for (var j = 0; j < node.Children.length; j++) {
                        $scope.getHtml(node.Children[j], node);
                    }
                }
            }
            $scope.tempContent += '</' + node.Type + '>';
        }
        else {
            $scope.tempContent += node.Content;
            //css
            if (parent && parent.Type == 'style') {
                var parent_wb_settings = parent.Settings;
                var wb_settings_css = null;
                if (parent_wb_settings && parent_wb_settings.length > 0) {
                    wb_settings_css = _.find(parent_wb_settings, function (item) {
                        return item.Type == 'css';
                    });
                }
                if (wb_settings_css && wb_settings_css.Value != '') {
                    $scope.tempContent += '\n' + wb_settings_css.Pattern.replace('[value]', wb_settings_css.Value);
                }
            }
        }

    }
    $scope.triggerJs = function (code) {
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

    $scope.searchNode = function (node, attr, value, isStart) {
        if (isStart) {
            $scope.currentJsonNode = null;
            $scope.isFound = false;
        }
        if (node.Attributes) {
            for (var i = 0; i < node.Attributes.length; i++) {
                if (node.Attributes[i].Key == attr && node.Attributes[i].Value == value) {
                    $scope.currentJsonNode = node;
                    $scope.isFound = true;
                    break;
                }
            }
        }
        if (!$scope.isFound && node.Children) {
            for (var j = 0; j < node.Children.length; j++) {
                $scope.searchNode(node.Children[j], attr, value, false);
                if ($scope.isFound) {
                    break;
                }
            }
        }
    };

    $scope.removeNodeIndex = -1;
    $scope.removeNode = function (node, attr, value, isStart) {
        if (isStart) {
            $scope.currentJsonNode = null;
            $scope.isFound = false;
            $scope.removeNodeIndex = -1;
        }
        if (node.Attributes) {
            for (var i = 0; i < node.Attributes.length; i++) {
                if (node.Attributes[i].Key == attr && node.Attributes[i].Value == value) {
                    $scope.currentJsonNode = node;
                    $scope.isFound = true;
                    break;
                }
            }
        }
        if (!$scope.isFound && node.Children) {
            for (var j = 0; j < node.Children.length; j++) {
                $scope.removeNode(node.Children[j], attr, value, false);
                if ($scope.isFound) {
                    if ($scope.removeNodeIndex == -1) {
                        $scope.removeNodeIndex = j;
                        node.Children.splice(j, 1);
                    }
                    break;
                }
            }
        }
    };

    $scope.getAttribute = function (node, key) {
        var value = null;
        for (var i = 0; i < node.Attributes.length; i++) {
            if (node.Attributes[i].Key == key) {
                value = node.Attributes[i];
                break;
            }
        }
        return value;
    };


});