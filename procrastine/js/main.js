/*
 * Procrastine app Chrome extension client
 */
$(function(){
    // Globals
    var BASE_BASEURL = "https://procrastine.ep.io/";
    // var BASE_BASEURL = "http://localhost:8000/";
    var BASE_URL = "";
    var api_key = localStorage.getItem('api_key');
    var reload_button = $("#reloadList");

    // Add a new Thing
    function addThing(){
        var button = $("input[type=submit]").attr("disabled", true).val('Saving...');
        var thing = $.trim($("input[name=thing]").val());
        if (thing.length) {
            $.post(BASE_URL +"/add/", {'content': thing}, function(json){
                if (json.status === 200) {
                    addThingToTheList(json.thing);
                    $("input[name=thing]").val('');
                } else {
                    showError(json.message);
                }
                button.attr("disabled", false).val('Add');
            },"json"); 
        }
        return false;
    }
    $("#add_thing").live('submit', addThing);

    // Add a thing list item 
    function addThingToTheList(json) {
        var li  = "<li style='display:none;'>";
            li += "<button type='button' class='remove' data-id='"+ json.id +"'>X</button>"; 
            if (json.type !== 'text') { 
                li += "<a href='#"+ json.url + "' target='blank' data-id='"+ json.id +"'>";
            }
            li += json.content;
            if (json.type !== 'text') {
                li += "</a>";
            }
            li += "</li>";
        $("#things").prepend($(li).fadeIn());
    }

    // Update the list of things
    function updateList(e) {
        e.preventDefault();
        var self = $(this).attr("disabled", true).html('loading...');
        $.post(BASE_URL +"/list/", null, function(json){
            self.attr("disabled", false).html('update list');
            var things = $("#things");
            if (json.status === 200) {
                if (json.things.length) {
                    things.html('');
                    for (k in json.things) {
                        addThingToTheList(json.things[k]);
                    }
                } else {
                    // things.append("<li class='empty'>"+ json.message +"</li>"); // useful ?
                }
            } else {
                things.append("<li class='error'>"+ json.message +"</li>");
            }
        },"json");
    }

    // Set a API key to the localStorage
    function setApiKey() {
        var api_key = $.trim($("input[name=api_key]").val());
        if (api_key.length) {
            var sha1 = RegExp("^[a-f0-9]{40}$");
            if (sha1.test(api_key)) {
                $("#api_key").hide();
                localStorage.setItem('api_key', api_key);
                BASE_URL = BASE_BASEURL + api_key;
                reload_button.click();
                $("#add_thing").show();
                $("#reloadList").show();
                $("#logout").show();
            } else {
                showError('Invalid API Key');
            }
        } else {
            showError('Error !!');
        }
    }
    $("#api_key input[type=button]").click(setApiKey);

    // Forget the Api Key and show the set api key form
    function clearApiKey(e) {
        localStorage.removeItem('api_key');
        $("#add_thing").hide();
        $("#reloadList").hide();
        $("#logout").hide();
        $("#api_key").show();
    }
    $("#logout").click(clearApiKey);

    // Show confirmation in place
    var old_confirm_html;
    function confirm_inline(where, message, no_callback, yes_callback) {
        old_confirm_html = where.html();
        where.html(message);
        where.append($("<button></button>").html("No").click(no_callback));
        where.append($("<button></button>").html("Yes").click(function(){
            $(this).attr("disabled", true);
            yes_callback();
        }));
    }

    // Remove click event
    $(".remove").live('click', function(){
        var button = $(this);
        var li = $(this).parent();
        confirm_inline(li, "remove 4ever?", function(){
            li.html(old_confirm_html);
        },function(){
            removeThing(button.data('id'), li);
        }); 
        
    });
    
    // remove a Thing forever
    function removeThing(id, li) {
        $.post(BASE_URL +"/remove/", {'id': id}, function(json){
            if (json.status === 200) {
                li.fadeOut("fast", function(){ $(this).remove(); });
            } else {
                showError(json.message);
            }
        },"json");
    }

    // Reload button event
    reload_button.click(updateList);
    
    // Initialize
    if (api_key === null) {
        $("#add_thing").hide();
        $("#reloadList").hide();
        $("#logout").hide();
        $("#api_key").show();
    } else {
        BASE_URL = BASE_BASEURL + api_key;
        $("#api_key").hide();
        reload_button.click();
    }

    // Show a error message for X seconds 
    function showError(message, timeout) {
        if (timeout === null || timeout === undefined) {
            timeout = 5000;
        } else {
            timeout *= 1000;
        }
        $("#error").html(message).show("fast", function(){
            setTimout(function(){
                $("#error").fadeOut();
            }, timeout);
        });
    }
});

