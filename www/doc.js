// Document helper functions
window.doc = {}

doc.loaded = function (func) {
    if (document.readyState == "complete" || document.readyState == "loaded") {
        func()
    } else {
        window.addEventListener('DOMContentLoaded', function() {
            func()
        })
    }
}

doc.get_id = function (id) {
	return document.getElementById(id)
}

doc.query = function (selector) {
    return document.querySelector(selector)
}

doc.query_all = function (selector) {
    var selected = document.querySelectorAll(selector)
    if (selected == null) { // return empty array if not found
        return [] }

    return selected
}

doc.get_class = function (_class) {
    return document.getElementsByClassName(_class)
}

doc.each_class = function (_class, func) {
    var class_els = doc.get_class(_class)
    for (var c=0; c<class_els.length; c++) {
        func(class_els[c])
    }
}

doc.clear_class_attr = function (className, attribute) {
    doc.each_class(className, function(same_class) {
        same_class.removeAttribute(attribute) 
    })
}


doc.increment_attr = function (el, attribute) {
    var current_value = parseInt(el.getAttribute(attribute))
    el.setAttribute(attribute, current_value + 1)
}


doc.capitalize = function (string) {
    var split_string = string.split(" ")
    for(var w=0; w<split_string.length; w++) {
        var word = split_string[w]
        split_string[w] = word[0].toUpperCase() + word.slice(1, word.length)
    }

    return split_string.join(" ")
}


doc.sort_alpha_numeric = function (array, key) {
    // sorts 0, 1a, 2, 2b, 3
    // takes object key or array index
    return array.sort(function(_a, _b){
        var a = _a[key]
        var b = _b[key]

        var reA = /[^a-zA-Z]/g;
        var reN = /[^0-9]/g;

        var aA = a.replace(reA, "");
        var bA = b.replace(reA, "");

        if (aA === bA) {
            var aN = parseInt(a.replace(reN, ""), 10);
            var bN = parseInt(b.replace(reN, ""), 10);
            return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
            return aA > bA ? 1 : -1;
        }
    })
}


doc.render = function (template, replacements) {
	if (typeof template == "string") {
		template = doc.get_id(template)
	}

	if (template == null) {
		return
	}
    
    template = template.cloneNode(true)
    var templateHTML = template.innerHTML
    var templateVariables = templateHTML.match(/\{\{[a-zA-Z0-9_]+\}\}/g)

    if (templateVariables != null) {
        for (var t=0; t<templateVariables.length; t++) {
        	var templateVariable = templateVariables[t]
            var variableName = templateVariable.slice(2, templateVariable.length - 2)
            var variableValue = replacements[variableName]
            if (typeof variableValue === "undefined") {
                variableValue = "" }

            if (replacements.hasOwnProperty(variableName)) {
                templateHTML = templateHTML.replace(new RegExp(templateVariable, "g"), variableValue)
            } else {
                templateHTML = templateHTML.replace(new RegExp(templateVariable, "g"), "")
            }
        }
    }

    template.innerHTML = templateHTML
    var templateChildren = template.content.children
    
    if(templateChildren.length == 1) {
        return templateChildren[0]
    } else {
        return templateChildren
    }

	return template
}


doc.create_el = function(elName, setters) {
    if (setters === undefined) {
        var setters = {} }
    var _el = document.createElement(elName); 
    var setternames = Object.keys(setters); 
    for(var i=0; i<setternames.length; i++) {
        var setter_name = setternames[i]
        var value = setters[setter_name]
        if (setter_name == "class") {
            console.error("use 'className' instead of 'class'")
        } else if (setter_name == "innerHTML") {
            _el.innerHTML = value
        } else if (setter_name == "children") {
            for(var c=0; c<setters.children.length; c++) {
                _el.appendChild(setters.children[c])
            }
        } else if (setter_name == "className") {
            _el.className = value
        } else if (setter_name == "style") {
            var styles_to_set = Object.keys(value)
            var styles = ""
            styles_to_set.forEach(function(style) {
                styles = styles + style + ":" + value[style]
                _el.setAttribute("style", styles)
            })
        } else {
            _el.setAttribute(setter_name, value)
        } 
    } 
    return _el
}


doc.get_json = function (filepath) {
    return new Promise(function(resolve, reject) {
        console.log("doc.get_json -> filepath", filepath);

        loadJSON(filepath, (json) => {
            resolve(json)
            console.log("doc.get_json -> json", json);
            // window.currentVersion =
            //     json.version_history[0].version;
            window.currentVersion = "2.0"
        });
    })
};


function loadJSON(filepath, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", filepath, true);
  // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4 && xobj.status === 200) {
      // Required use of an anonymous callback
      // as .open() will NOT return a value but simply returns undefined in asynchronous mode
      callback(JSON.parse(xobj.responseText));
    }
  };
  xobj.send(null);
}

function submit_form (event) {
    // works in tandem with doc.render_form
    event.preventDefault()
    event.stopPropagation()

    var form = event.currentTarget
    var editing = (form.getAttribute("editing") == "true")
    var form_data = doc.serialize(form, true)
    var model_name = form.getAttribute("model-name")
    var form_errors = data.validate_model(model_name, form_data)

    if (form_errors.length == 0) {
        if (model_name == "Invitation" && editing == false) {
            data.create_model("Mail", {
                to: form_data.email.trim(),
                message: {
                    subject: "You've been invited to KidTalk!",
                    text: "You have recently been invited to KidTalk! You can sign up for an account with this email address (" + form_data.email.trim() + ") at " + window.location.origin,
                    html: "You have recently been invited to KidTalk! You can sign up for an account with this email address (" + form_data.email.trim() + ") at <a href='" + window.location.origin + "'>" + window.location.origin + "</a>."
                }
            })

            form_data.email = CryptoJS.MD5(form_data.email.trim()).toString();
            db.collection("User")
                .where("email", "==", form_data.email)
                .limit(1)
                .get()
                .then((query) => {
                    if (!query.empty) {
                        data.create_model("TaggedAdult", {
                            first_name: query.docs[0].data().first_name,
                            parent_avatar: query.docs[0].data().parent_avatar,
                            original_creator: form_data.original_creator,
                            email: form_data.email,
                        });
                        data.create_model("Invitation", {
                            name: query.docs[0].data().first_name,
                            email: form_data.email,
                            record_access: form_data.record_access,
                            original_creator: form_data.original_creator,
                            kid: form_data.kid
                        });
                    } else {
                        data.create_model("TaggedAdult", {
                            first_name: form_data.name,
                            original_creator: form_data.original_creator,
                            email: form_data.email,
                        });
                        data.create_model("Invitation", {
							name: form_data.name,
							email: form_data.email,
							record_access: form_data.record_access,
							original_creator: form_data.original_creator,
							kid: form_data.kid,
						});
                    }
                    doc.close_modal();
                })
                .catch(function (error) {
                    console.log(error);
                });
                
                return false;

        }
        if (model_name == "Invitation" && editing == true) {
            db.collection("TaggedAdult")
				.where("email", "==", form_data.email)
				.limit(1)
				.get()
				.then((query) => {
					if (query.empty) {
						data.create_model("TaggedAdult", {
							first_name: form_data.name,
							original_creator: form_data.original_creator,
							email: form_data.email,
						});
					}
				})
				.catch(function (error) {
					console.log(error);
				});
            data.update_model(model_name, form_data.id, form_data)
                .then(function (updated_model) {
                    doc.close_modal(form);
                    if (model_name == "User") {
                        load_settings(window.user_id);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
                return false;
        }

        if (model_name == "TaggedAdult" && editing == false) {
			doc.navigate("/consent");
			doc.get_id("sign_consent_adult").style.display = "block";
			doc.get_id("adult-name").innerHTML = form_data.first_name;
			doc.get_id("adult-name2").innerHTML = form_data.first_name + "s";
			doc.get_id("other-adult").innerHTML = "Please have " + form_data.first_name + " read and sign the following:";

            window.adult_model = form_data
            doc.close_modal()

            return false
        }
		if (model_name == "TaggedAdult" && editing == true) {
            if (form_data.email){
                db.collection("User")
					.where("email", "==", form_data.email)
					.limit(1)
					.get()
					.then((query) => {
						if (!query.empty) {
                            form_data.first_name = query.docs[0].data().first_name;
                            form_data.parent_avatar = query.docs[0].data().parent_avatar;

                        }
                        data.update_model(model_name, form_data.id, form_data)
                            .then(function (updated_model) {
                                doc.close_modal(form);
                                if (model_name == "User") {
                                    load_settings(window.user_id);
                                }
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
					})
					.catch(function (error) {
						console.log(error);
					});
            }
            else {
                data.update_model(model_name, form_data.id, form_data)
                    .then(function (updated_model) {
                        doc.close_modal(form);
                        if (model_name == "User") {
                            load_settings(window.user_id);
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
			return false;
		}

        if (model_name == "User" && editing == true) {
            if (window.parent_avatar || window.user.parent_avatar) {
				db.collection("TaggedAdult")
					.where("email", "==", window.user.email)
					.get()
					.then((query) => {
                        query.docs.forEach((tag)=>{
                            tag.ref.update({
                                parent_avatar: form_data.parent_avatar,
                            })
                        })
					});
			}
		}

        if (model_name == "Kid" && editing == false) {
            var today = new Date();
            var year = today.getFullYear();
            var monthNames = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
            ];
            
            var monthIndex = today.getMonth();
            var kidMonthIndex = monthNames.indexOf(form_data.birth_month);
            if(kidMonthIndex > monthIndex && form_data.birth_year >= year) {
                alert("The birth date you have selected is in the future. Please select a birth date prior to today's date.")
                return;
            }
        }

        if (editing == true) {
            data.update_model(model_name, form_data.id, form_data).then(function(updated_model) {
                doc.close_modal(form)

                if (model_name == "User") {
                    load_settings(window.user_id)
                }
            }).catch(function (error) {
                console.log(error)
            })
        } else {
            data.create_model(model_name, form_data).then(function(model_id){
                doc.close_modal(form)

            }).catch(function(error) {
                console.log(error)
            })
        }
    } else {
        console.log(form_errors)
        alert(form_errors.toString())
    }
}


doc.render_form = function (model_name, prefills, hidden_fields, field_order, form_class) {
    // works in tandem with window.submit_form
    if (window.hasOwnProperty(model_name) == false) {
        console.log("Define a model name")
        return }

    var model = window[model_name]
    if (prefills == null) {
        prefills = {} }

    Object.keys(prefills).forEach(function(prefill) {
        var prefill_value = prefills[prefill]
        if (prefill_value == "" || prefill_value == null) { // cover case where it equals 0
            delete prefills[prefill]
        }
    })

    if (hidden_fields == null) {
        hidden_fields = [] }

    if (field_order == null) {
        field_order = Object.keys(model)}

    if (form_class == null) {
        form_class = "custom-form" }

    var editing = prefills.hasOwnProperty('id')
    var form = doc.create_el("form", {
        className: form_class,
        "model-name": model_name,
        "editing": editing,
        "onsubmit": "submit_form(event)" })
 
    field_order.forEach(function(field_name){
        var input_obj = {name: field_name}
        if (model[field_name] instanceof Requirement) {
            var constructor = model[field_name].field
            input_obj.required = ""
        } else {
            var constructor = model[field_name]
        }

        var constructor_name = constructor.name
        if (prefills.hasOwnProperty(field_name) == true) {
            var prefilled_value = prefills[field_name]

            if (Array.isArray(constructor) == true) {
                var cast_value = prefilled_value
            } else {
                var cast_value = constructor(prefilled_value)    
            }
        } else {
            var cast_value = ""
        }

        if (hidden_fields.indexOf(field_name) > -1) {
            input_obj.type = "hidden"
            input_obj.value = cast_value
            var form_field = doc.create_el("input", input_obj)
        } else if (Array.isArray(constructor) == true) {
            var form_options = []
            constructor.forEach(function (option) {
                var option_obj = {
                    innerHTML: option,
                    value: option }
                if (option == cast_value) {
                    option_obj.selected = "" }
                form_options.push(doc.create_el("option", option_obj))
            })

            input_obj.children = form_options
            input_obj.className = "custom-select"
            var form_field = doc.create_el("select", input_obj)
        } else if (field_name.indexOf("_avatar") > -1) {
            var avatar_type = field_name.replace("_avatar", "")
            
            var img_children = []
            var avatar_count = 24
            if (avatar_type == "parent") {
                avatar_count = 42 }

            for (var c=1; c<=avatar_count; c++) {
                img_children.push(doc.create_el("img", {
                    src: "/images/SVG/Avatars/" + avatar_type + "/" + c + ".svg",
                    className: "avatar",
                    onclick: "select_avatar(this)",
                    selected: (Number(cast_value) == Number(c)),
                    "data-value": c,
                    "data-name": field_name
                }))
            }

            var form_field = doc.create_el("div", {
                className: "avatars",
                children: img_children
            })
        } else {
            input_obj.value = cast_value
            
            if (constructor_name == "Date") {
                input_obj.type = "date"
            } else if (constructor_name == "Boolean") {
                input_obj.type = 'checkbox'
            } else if (constructor_name == "Number") { 
                input_obj.type = "number"
            } else {
                input_obj.type = 'text'
            }

            if (input_obj.type == 'checkbox') {
                var checked = ""
                if (cast_value == true) {
                    checked = "checked" }
                
                var form_field = doc.render(doc.get_id("custom-checkbox"), {
                    checked: checked,
                    name: field_name,
                    display_name: field_name.replace("_", " ")
                })
            } else {
                var form_field = doc.create_el("input", input_obj)    
            }
        }

        var field_children = []
        if (hidden_fields.indexOf(field_name) == -1 && input_obj.type != 'checkbox') {
            var field_name_string = field_name
            if (field_name == "first_name") {
                field_name_string = "Nickname"
            }
            
            if (field_name == "parent_avatar") {
                field_name_string = "Avatar";
            }

            var label = doc.create_el("label", {
                innerHTML: field_name_string.replace("_", " ") 
            })

            field_children.push(label)
        }

        field_children.push(form_field)
        var field_wrapper = doc.create_el("div", {
            className: "field-wrapper",
            children: field_children })

        form.appendChild(field_wrapper)
    })

    var model_name_string = model_name
    if (model_name == "TaggedAdult") {
        model_name_string = "Tagged Adult"
    }

    var submit_button = "Add " + model_name_string
    if (editing == true) {
        submit_button = "Update " + model_name_string }

    form.appendChild(doc.create_el("input", {
        type: 'submit',
        value: submit_button }))

    if (editing == true && model_name != "User") {
        var delete_button = doc.create_el("div", {
            className: "delete-model",
            innerHTML: "Delete this " + model_name_string, 
            onclick: "data.delete_model('" + model_name + "', '" + prefills.id + "'); doc.close_modal(this)"
        })
        form.appendChild(delete_button)
    }

    return form
}


doc.notify_success = function (message, modal_size) {
    var notif_el = doc.create_el("div", {
        className: 'notification',
        innerHTML: message
    })
    
    doc.render_modal(notif_el.outerHTML, false, modal_size)
    setTimeout(function () {
        doc.close_modal()
    }, 3000)
}



doc.notify_failure = function (el, message) {} // shake


doc.render_modal = function (modal_html, hide_close, modal_size) {
    document.body.setAttribute("show-modal", true)
    doc.get_id("modal-content").innerHTML = modal_html
    doc.get_id("modal-close").setAttribute("hide-close", hide_close)

    if (modal_size == null) {
        modal_size = "normal" }
    doc.get_id("modal-container").setAttribute("modal-size", modal_size)
}


doc.close_modal = function () {
    if (doc.get_id("modal-content")
        .querySelector('form.survey-question-form')) {
        data.get_model_including_id("User", window.user_id).then(function(user_obj) {
            var update_user_obj = user_obj;
            update_user_obj.last_saw_survey = (new Date).getTime()
            data.update_model("User", user_obj.id, update_user_obj).then(function(model) {

            })
        })
    }
    document.body.removeAttribute("show-modal")
}


doc.create_model_modal = function (model_name, prefills, hidden_fields, field_order) {
    var model_form = doc.render_form(model_name, prefills, hidden_fields, field_order)
    doc.render_modal(model_form.outerHTML)
}

doc.serialize = function (form, include_false_checkboxes) {
    var form_obj = {}
    var tags_to_serialize = ['input', 'select']
    for (var t=0; t<tags_to_serialize.length; t++) {
        var form_tags = form.querySelectorAll(tags_to_serialize[t])
        for (var f=0; f<form_tags.length; f++) {
            var field_type = form_tags[f].getAttribute("type")
            if (field_type == "checkbox") {
                if (form_tags[f].checked == true || include_false_checkboxes == true) {
                    form_obj[form_tags[f].name] = form_tags[f].checked
                }
            } else if (field_type == 'radio') {
                if (form_tags[f].checked) {
                    form_obj[form_tags[f].name] = form_tags[f].value
                }
            } else if (form_tags[f].value != "" && field_type != "submit") {
                form_obj[form_tags[f].name] = form_tags[f].value
            }
        }
    }
    return form_obj
}


doc.parse_url = function (url) {
    if (url == undefined) {
        url = window.location.pathname }

    var split_url = []
    url.split("/").forEach(function(part) {
        if (part != "") { 
            split_url.push(part) } 
    })

    var url_object = []
    for (var o=0; o<split_url.length; o++) {
        var page_url = split_url[o]
        var split_page_url = page_url.split("~")
        var page_obj = [split_page_url[0]]
        if (split_page_url.length > 1) {
            options = split_page_url[1]
            options.split("&").forEach(function(option) {
                var split_option = option.split("=")
                var key = split_option[0]
                var value = split_option[1]
                if (key != "") {
                    page_obj.push([key, value])     
                }
            })
        }
        url_object.push(page_obj)
    }

    return url_object
}


doc.construct_url = function (url_object) {
    var url = ""
    url_object.forEach(function(page){
        url = url + "/" + page[0] + "~"
        if (page.length > 1) {
            var options = page.slice(1, page.length)
            options.forEach(function(option, index){
                url = url + option[0] + "=" + option[1] + "&"
            })
        }

        if (url[url.length - 1] == "&") {
            url = url.slice(0, url.length - 1)
        }
    })

    if (url[url.length - 1] == "~") {
        url = url.slice(0, url.length - 1)
    }

    return url
}

doc.clear_and_replace = function (_data, container, template) {
    container.innerHTML = ""
    _data.forEach(function(datum){
        var template_el = doc.render(template, datum)
        container.appendChild(template_el)
    })
}

doc.navigate = function (app_link) {
    if (typeof app_link == "string") {
        new_page_link = app_link
    } else {
        new_page_link = app_link.getAttribute("link")
    }

    history.pushState(new_page_link, null, new_page_link);

    doc.get_id("menu-icon").setAttribute("show", false)
}

window.onpopstate = history.onpushstate = function(e) {
    doc.get_id("app-pages").setAttribute("page", e.state)

    if (e.state == "/scrapbook" && window.user_id != undefined) {
        load_scrapbook(window.user_id, window.user_email)
    } else if (e.state != "/scrapbook") {
        unload_scrapbook()
    }

    if (e.state != "/record") {
        try {
            discard_audio()
        } catch(error) {
            console.log('error discarding audio')
        }
        
    }
    
    if (e.state == "/logout") {
        logout()
    }
};