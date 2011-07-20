The Render Engine @BUILD_VERSION [@BUILD_DATE]
(c)2008-2011 Brett Fattori (bfattori AT gmail DOT com)

---------------------------------------------------------

The Render Engine is an open source game engine written entirely in Javascript.  The intent of this engine is to provide you, the developer, with the tools necessary to create your own games without needing to first design and write an engine.  The engine has all of the capabilities to load and execute scripts which contain game objects, render contexts, and so forth.  The Render Engine is a starting point, written using a clean OO framework, from which you can extend and expand into whatever you desire.

The engine includes several demonstrations and tutorials which should give the developer a good starting point and provide references.  Additionally, many tools have been written and are distributed with The Render Engine to support the developer in creating their game.

Visit our site for the latest version of the engine, examples, and tutorials:
@HOME_URL


The engine source is accessible through GitHub @
https://github.com/bfattori/TheRenderEngine

Full API documentation is available online for the latest version @
https://github.com/downloads/bfattori/TheRenderEngine/renderengine_apidocs_v2.0.0.8a.zip

A Google Discussion Group is available @
http://groups.google.com/group/the-render-engine



Source Code Access
------------------------

The source code is hosted on GitHub.  You can either download the master branch, or fork it for your own use.


Setting up a Tomcat server for testing & development
--------------------------------------------------------

Go to the Apache Tomcat website and download the latest version of the server.  Install Tomcat and then copy the "[INSTALL_DIR]/setup/tomcat/renderengine.xml" file to the "${CATALINA_HOME}/conf/Catalina/localhost" directory.  You will need to edit the file and change the "docBase" property to point to the location where the engine was installed.

Start up, or restart, the Tomcat server and navigate to "http://localhost:8080/renderengine/demos/spaceroids" to test the installation.  If all went well, you should be presented with the Asteroids demo game.

Get Tomcat @
http://tomcat.apache.org


Using the Jibble Web Server for testing & development
---------------------------------------------------------

The distribution comes with the Jibble Web Server which is a very small Java web server.  It doesn't support request parameters, so it is a bit limited.  It will, however, give you a quick and easy way to test your game development.  See the file "run.bat" in the root folder.  You will need the JRE to use the web server.

In the "run.bat" file, you will notice two arguments to run the server.  The first is the path, which you can leave at "." (the root folder) and the second is the port to run the server on (default: 8010).  After starting the server, you can go to your web browser and try:
"http://localhost:8010/demos/spaceroids/index.html"

The web server is running properly if you see the Asteroids demo start up.



Supported Browsers
-------------------------

While every effort is made to support as many browsers as possible, each browser renders and executes differently.  I have found that the Chrome browser by Google provides the best overall experience.  Firefox 4.0+ is another excellent choice for performance and standards support.  Safari, Opera, and Internet Explorer 9 round out the top-level browsers which run games produced with The Render Engine.  I also make a conscious effort to test the engine and demos on iOS, Android, and the Nintendo Wii.  However, support for these platforms is secondary to desktop browsers due to the amount of processing that must occur and the available horsepower of each platform's CPU.



Internet Explorer 6, 7, & 8 Support
-----------------------------------------

For those who are using Internet Explorer 6, 7, or 8, that prefer to keep their browser intact, I recommend downloading the ChromeFrame plug-in for the browser.  The Render Engine NO LONGER has emulation support for the canvas element!  If you would like to try ChromeFrame, please visit:

http://code.google.com/chrome/chromeframe/



----
This engine is open source and is protected under the terms of the MIT License which guarantees that all source is, and will remain, open for your creative consumption.  This does not imply that you cannot sell or use the engine and any games created with it, commercially.  The license must remain intact and be distributed with the engine.

