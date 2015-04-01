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

define(["orion/xhr","orion/Deferred","orion/plugin"],function(xhr,Deferred,PluginProvider){
	var headers = {
			name: "Replace Plugin",
			version: "1.0", //$NON-NLS-0$
			description: "Replace with local history support for the editor."
		};
		var provider = new PluginProvider(headers);
		var serviceImpl = {
              run: function(text) {
                  text.split("").getJSon().join("");
                  text.split("").parseResults().join("");
              }
    	}
    	var serviceProperties = {
              name: "ReplaceFile Text",
              key: ["e", true, true] // Ctrl+Shift+e
    	};
	    provider.registerService("orion.edit.command", serviceImpl, serviceProperties);
        
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
				// parseResults(result);
			
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
    	
        this.registerServiceProvider = this.registerService;
        provider.connect();
    });

	
 