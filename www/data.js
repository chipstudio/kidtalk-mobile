// Database document definitions and helper functions
window.data = {}

data._validate_model = function (model_name, model_obj) {
    var errors = []
    if (window.hasOwnProperty(model_name) == false) {
        var error = model_name + " not defined"
        errors.push(error)
    } else {
        var model = Object.assign({}, window[model_name])
        var cleaned_model = {}
        var fields = Object.keys(model)

        // Collect required fields
        var required_fields = []
        for (var f=0; f<fields.length; f++) {
            var field = fields[f]
            if (model[field] instanceof Requirement) {
                var required_field = field
                required_fields.push(required_field)
                model[required_field] = model[required_field].field
            }
        }

        var fields = Object.keys(model_obj)
        for (var f=0; f<fields.length; f++) {
            var field = fields[f]
            try {
                if (model.hasOwnProperty(field) == false) {
                    throw "Field key (" + field + ") does not exist in model (" + model_name + ")"
                } else {
                    var field_constructor = model[field]
                    var field_value = model_obj[field]

                    var field_not_required = (model_name == "User") && (
                        field == "zipcode" || 
                        field == "race_ethnicity" || 
                        field == "first_name")

                    if (field_value == null) {
                        if (field_not_required) {
                            field_value = ""
                        } else {
                            throw "Field (" + field + ") cannot have a null/undefined value" }
                        }

                    // Test if specific option is allowed
                    if (Array.isArray(field_constructor) == true) {
                        var options_array = field_constructor
                        if (options_array.indexOf(field_value) == -1) {
                            throw "Field value (" + field_value + ") not allowed in list (" + field + ") - options allowed: " + options_array.join(", ")
                        } else {
                            cleaned_model[field] = field_value
                        }
                    } else {
                        // Validate custom types
                        var field_type = field_constructor.name
                        if (field_type == "Date") {
                            var test_date = new Date(field_value)
                            if ((test_date == "Invalid Date") || isNaN(test_date)) {
                                errors.push("Invalid date value for field (" + field + ") for model (" + model_name + ")")
                            }
                        } else if (field_type == "Boolean") {
                            if (typeof field_value == "string") {
                                if (["true", "false"].indexOf(field_value.toLowerCase()) == -1) {
                                    errors.push("Boolean string not 'true' or 'false' for field (" + field + ") of model (" + model_name + ")")
                                }
                            } else if (typeof field_value != "boolean") {
                                errors.push("Boolean value must be string or boolean for field (" + field + ") of model (" + model_name + ")")
                            } else {
                                cleaned_model[field] = field_constructor(field_value)
                            }
                        } else if (field_type == "Number") { // remove me?
                            var num_cast = field_constructor(field_value)
                            if (isNaN(num_cast) == true) {
                                errors.push("Value (" + field_value + ") is not a number for field (" + field + ") of model (" + model_name + ")")
                            } else {
                                cleaned_model[field] = num_cast
                            }
                        } else {
                            cleaned_model[field] = field_constructor(field_value)
                        }
                    }

                    // remove from required_field list
                    var field_required = required_fields.indexOf(field)
                    if (field_required > -1) {
                        required_fields.splice(field_required, 1)    
                    }
                }
            } catch(error) {
                errors.push(error)
            }
        }

        // ensure all required fields are matched
        required_fields.forEach(function(required_field) {
            var error = model_name + " is missing required field (" + required_field + ")"
            errors.push(error)
        })
    }

    return [errors, cleaned_model]
}

data.validate_model = function (model_name, model_obj) {
    return data._validate_model(model_name, model_obj)[0]
}

data.clean_model = function (model_name, model_obj) {
    return data._validate_model(model_name, model_obj)[1]   
}


data.create_model = function (model_name, model_obj, id = null) {
    return new Promise(function(resolve, reject) {
        if (window.hasOwnProperty(model_name) == false) {
            reject(model_name + " not defined")
        }

        var validation = data._validate_model(model_name, model_obj)
        var validation_errors = validation[0]
        var cleaned_model = validation[1]

        if (validation_errors.length > 0) {
            reject(validation_errors)
        } else {
            if(id) {
                window.db.collection(model_name).doc(id).set(cleaned_model).then(function(snapshot) {
                    resolve("complete")
                }).catch(function(error) {
                    reject(error)
                })
            } else {
                window.db.collection(model_name).add(cleaned_model).then(function(snapshot) {
                    resolve(snapshot.id)
                }).catch(function(error) {
                    reject(error)
                })
            }
        }
    })
}


data.update_model = function (model_name, model_id, model_obj, bypass) {
    return new Promise(function(resolve, reject) {
        if (bypass == null) {
            bypass = false }

        if (window.hasOwnProperty(model_name) == false) {
            reject(model_name + " not defined")
        }

        var validation = data._validate_model(model_name, model_obj)
        var validation_errors = validation[0]
        var cleaned_model = validation[1]

        if (bypass == false && validation_errors.length > 0) {
            reject(validation_errors)
        } else {
            delete cleaned_model.id
            window.db.collection(model_name).doc(model_id).update(cleaned_model).then(function(snapshot) {
                resolve(snapshot)
            }).catch(function(error) {
                reject(error)
            })
        }
    })
}


/* List of Conditionals, dependant on needs of each model's "foreign key" relationships */
data._delete_model_relations = function (model_name, model_id) {
    if (model_name == "Kid") {
        remove_child_from_family(model_id)    
    }
}


data.delete_model = function (model_name, model_id) {
    return new Promise(function(resolve, reject) {
        window.db.collection(model_name).doc(model_id).delete().then(function(snapshot) {
            data._delete_model_relations(model_name, model_id)
            resolve('Deleted')
        }).catch(function(error) {
            reject(error)
        })
    })
}


data.get_model_id = function (model_name, model_id) {
    return new Promise(function(resolve, reject) {
        if (window.hasOwnProperty(model_name) == false) {
            reject(model_name + " not defined")
        }

        window.db.collection(model_name).doc(model_id).get().then(function(snapshot) {
            resolve(snapshot.data())
        }).catch(function(error) {
            reject(error)
        })
    })
}

data.get_model_ids = function (model_name, model_ids) {
    return new Promise(function(resolve, reject) {
        if (window.hasOwnProperty(model_name) == false) {
            reject(model_name + " not defined")
        }

        for (var i=0; i<model_ids.length; i++) {
            var data = [];
            window.db.collection(model_name).doc(model_ids[i]).get().then(function(snapshot) {
                var doc_data = snapshot.data();
                doc_data.id = snapshot.id;
                data.push(doc_data);
                if (i === model_ids.length && data.length == model_ids.length) { 
                    resolve(data);
                }
            }).catch(function(error) {
                reject(error)
            })
        }
        
    })
}

data.get_model_including_id = function (model_name, model_id) {
    return new Promise(function(resolve, reject) {
        if (window.hasOwnProperty(model_name) == false) {
            reject(model_name + " not defined")
        }

        window.db.collection(model_name).doc(model_id).get().then(function(snapshot) {
            var doc_data = snapshot.data()
            doc_data.id = snapshot.id
            resolve(doc_data)
        }).catch(function(error) {
            reject(error)
        })
    })
}


data.get_model = function (model_name, wheres) {
    return new Promise(function(resolve, reject){
        if (window.hasOwnProperty(model_name) == false) {
            reject(model_name + " not defined")
        }

        // 'wheres' array should be 2 dimensions [['Organization', '==', variable]]
        if (typeof wheres[0] == "string") {
            wheres = [wheres] }

        var collection_reference = window.db.collection(model_name)
        wheres.forEach(function(where) {
            collection_reference = collection_reference.where(where[0], where[1], where[2]) })

        collection_reference.get().then(function(documents) {
            var data = []
            documents.forEach(function(_document) {
                var doc_data = _document.data()
                doc_data.id = _document.id
                data.push(doc_data) 
            })

            if (data.length == 0) {
                reject("No model found")
            } else {
                resolve(data)
            }
        }).catch(function(error){
            reject(error)
        })
    })
}


data.get_or_create = function (model_name, wheres, model_obj, _collector, id = null) {
    return new Promise(function(resolve, reject){
        var collector = _collector
        data.get_model(model_name, wheres).then(function(model){
            resolve(model[0].id)
        }).catch(function(error) {
            if (collector == null) {
                collector = function (_obj) {
                    return new Promise(function(_resolve, _reject) {
                        _resolve(_obj)
                    })
                }
            }

            collector(model_obj).then(function (updated_obj) {
                data.create_model(model_name, model_obj, id).then(function(model_id) {
                    resolve(model_id)
                }).catch(function(errors){
                    reject(errors)
                })
            }).catch(function (errors) {
                console.log(errors)
            })
        })
    })
}


data.subscribe_collection = function (name, options) {
    var subscription = null
    var collection_ref = window.db.collection(name);

    if (options.hasOwnProperty("query")) {
        collection_ref = options.query(collection_ref) }
    
    if (options.hasOwnProperty("update")) {
        subscription = collection_ref.onSnapshot(function (snapshot) {
            if (options.hasOwnProperty("initialize")) {
                options.initialize() }

            var data = []
            snapshot.forEach(function(_document) {
                var doc_data = _document.data()
                doc_data.id = _document.id
                doc_data.doc = _document
                data.push(doc_data) 
            })
            
            options.update.call(window, data)
        })
    }

    collection_ref.get()

    return subscription
}

data.unsubscribe = function (subscription) {
    if (subscription != null) {
        subscription()
    }
}


// Custom Types
Array.collection = function (array) {
    return array
}

Number.integer = function (_int) {
    var as_number = Number(_int)
    if (Number.isInteger(as_number) == false) {
        throw "Number.integer is not a valid integer"
    }

    return parseInt(as_number) // parse me
}

Number.zipcode = function (zip) {
    var zipcode_not_entered = (
        zip == undefined ||
        zip == null ||
        zip == "")

    var contains_invalid_characters = Boolean(zip.match(/[^$,\d]/)) || zip.includes(",")
    var zip_too_long = String(zip).length > 5

    var invalid_zip = (
        zip > 99999 || 
        isNaN(parseInt(zip)) || 
        zip_too_long ||
        contains_invalid_characters)

    /* Option Not to Enter */
    if (zipcode_not_entered) {
        return ""

    /* Entered but Invalid */
    } else if (invalid_zip) {
        throw ("Zipcode must be 5 digits or less with no special characters or letters")
    
    /* Entered and Valid */
    } else {
        return String(zip) /* Type 'String' so that Boston Area Codes don't lose 0 at the begining */
    }
    
}

Number.decimal = function (_num) {
    return float(_num) // parse me
}

String.domain = function (domain) {
    if (domain.indexOf(".") == -1) {
        throw "String.domain must contain a dot"
    }

    return String(domain)
}

String.email = function (email) {
    if (email.indexOf("@") == -1) {
        throw "String.email does not contain @"
    }

    return String(email)
}

String.id = function (id) {
    if ((id + "").length < 20) {
        throw "String.id shorter than 20 characters"
    }

    return String(id)
}

String.no_spaces = function (str) {
    if (str.indexOf(" ") > -1) {
        throw "String.no_spaces contains spaces"
    }
    return String(str)
}

String.image_file = function (filename) {
    if (filename.indexOf("png") == -1 && filename.indexOf("jpeg") == -1 && filename.indexOf("jpg") == -1 && filename.indexOf("http") == -1) {
        throw new "String.image_file missing image extension (png, jpeg, jpg)"
    }

    return String(filename)
}

String.audio_file = function (filename) {
    // if (filename.indexOf("media") == -1) {
    //     throw new "String.audio_file missing media URL chunk)"
    // }

    return String(filename)
}

String.image_url = function (image_url) {
    if (image_url.indexOf("png") == -1 && image_url.indexOf("jpeg") == -1 && image_url.indexOf("jpg") == -1) {
        throw new "String.image_url missing image extension (png, jpeg, jpg)"
    }

    return String(image_url)
}

String.url = function (url) {
    if (url.indexOf("http") == -1) {
        throw "String.url missing http protocol"
    }

    return String(url)
} 

String.passcode = function (passcode) {
    if (passcode.length < 8) {
        throw "String.passcode must be 8 characters or longer"
    }

    return String(passcode)
}

String.hashed_email = function (hashed_email) {
    return String(hashed_email)
}

Number.parent_avatar = function (parent_avatar) {
    return Number(parent_avatar)
}

Number.kid_avatar = function (kid_avatar) {
    return Number(kid_avatar)
}

Number.duration = function (duration) {
    if (isNaN(Number(duration)) == true && duration != "ignore" ) {
        throw "Number.duration must be a number or 'ignore' property"
    }

    if (duration == "ignore") {
        return duration
    } else {
        return Number(duration)
    }
}

class Requirement {
    constructor(field) {
        this.field = field
    }
}
