/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
/*global URL*/
/*globals ActiveXObject alert createXMLHttpRequest p_here orion*/

define(["orion/xhr","orion/Deferred"],function(xhr,Deferred,root,factory){
		if (typeof define === "function" && define.amd) { //$NON-NLS-0$
        define(["orion/Deferred"], factory);
    } else if (typeof exports === "object") { //$NON-NLS-0$
        module.exports = factory(require("orion/Deferred"));
    } else {
        root.orion = root.orion || {};
        root.orion.PluginProvider = factory(root.orion.Deferred);
    }
	}(this, function(Deferred,xhr) {
   		function ObjectReference(objectId, methods) {
       		this.__objectId = objectId;
        	this.__methods = methods;
    	}
	  
	  function PluginProvider(headers) {
        var _headers = headers;
        var _connected = false;

        var _currentMessageId = 0;
        var _currentObjectId = 0;
        var _currentServiceId = 0;

        var _requestReferences = {};
        var _responseReferences = {};
        var _objectReferences = {};
        var _serviceReferences = {};
        
        var _target = null;
        if (typeof(window) === "undefined") { //$NON-NLS-0$
            _target = self;
        } else if (window !== window.parent) {
            _target = window.parent;
        } else if (window.opener !== null) {
            _target = window.opener;
        }   
            
        function _getPluginData() {
            var services = [];
            // we filter out the service implementation from the data
            Object.keys(_serviceReferences).forEach(function(serviceId) {
                var serviceReference = _serviceReferences[serviceId];
                services.push({
                    serviceId: serviceId,
                    names: serviceReference.names,
                    methods: serviceReference.methods,
                    properties: serviceReference.properties
                });
            });
            return {
                headers: _headers || {},
                services: services
            };
        }
        
	  	function deleteTempOperation(operationLocation) {
				xhr("DELETE", operationLocation, {
					headers: {
						"Orion-Version": "1"
					},
					timeout: 15000
				});
			}
		
		var url="org.eclipse.orion.internal.server.servlets.file.FileHandlerV1.handleRequest";
		
		function getJSon(operation, deferred, onResolve, onReject) {
			xhr("GET", url, {
				headers : { 
						"Orion-Version" : "1",
						"Content-Type" : "text/html"
				},
			timeout: 15000,
			handleAs : "json" //$NON-NLS-0$
			}).then(function(result) {
				var operationJson = result.response ? JSON.parse(result.response) : null;
				deferred.progress(operationJson);
				parseResults(result);
			
			if (operationJson.type === "error" || operationJson.type === "abort") {
				deferred.reject(onReject ? onReject(operationJson) : operationJson.Result);
			} else {
				deferred.resolve(onResolve ? onResolve(operationJson) : operationJson.Result.JsonData);
			}
			if (!operationJson.Location) {
				deleteTempOperation(operation.location); //This operation should not be kept 
			}
		}, function(error) {
			var errorMessage = error;
			if (error.responseText !== undefined) {
				errorMessage = error.responseText;
				try {
					errorMessage = JSON.parse(error.responseText);
				} catch (e) {
					//ignore
				}
			}
			if (errorMessage.Message !== undefined) {
				errorMessage.HttpCode = errorMessage.HttpCode === undefined ? error.status : errorMessage.HttpCode;
				errorMessage.Severity = errorMessage.Severity === undefined ? "Error" : errorMessage.Severity;
				deferred.reject(errorMessage);
			} else {
				deferred.reject({
					Severity: "Error",
					Message: errorMessage,
					HttpCode: error.status
				});
			}
		});
	}
    	
	
		function parseResults(fileHistory) { 
  			//display and analyze the result
			var returnResult = eval(fileHistory);
			alert(returnResult.parts);
			var fso= new ActiveXObject("Scripting.FileSystemObject");  
    
    		var f = fso.GetFolder(returnResult.parts);
    		var fc = new Enumerator(f.files);
   	 		var s = "";
    		for (; !fc.atEnd(); fc.moveNext())
        	{
				s += "<a href="+fc.item()+">";
            	s += fc.item();
				s += "</a>";
            	s += "<br/>";
        	}
        	fk = new Enumerator(f.SubFolders);
        	for (; !fk.atEnd(); fk.moveNext())
     		{
        		s += fk.item();
        		s += "<br/>";
        	}
        	textarea.innerHTML = s;
    	}
    	
       
    	this.updateHeaders = function(headers) {
            if (_connected) {
                throw new Error("Cannot update headers. Plugin Provider is connected");
            }
            _headers = headers;
        };

        this.registerService = function(names, implementation, properties) {
            if (_connected) {
                throw new Error("Cannot register service. Plugin Provider is connected");
            }

            if (typeof names === "string") {
                names = [names];
            } else if (!Array.isArray(names)) {
                names = [];
            }

            var method = null;
            var methods = [];
            for (method in implementation) {
                if (typeof implementation[method] === 'function') { //$NON-NLS-0$
                    methods.push(method);
                }
            }
            _serviceReferences[_currentServiceId++] = {
                names: names,
                methods: methods,
                implementation: implementation,
                properties: properties || {},
                listeners: {}
            };
        };
        this.registerServiceProvider = this.registerService;
    }
    
    return PluginProvider;
}));

	
 