This is server for managing configurations for development efforts.

# Background
Documenting configuration files is crucial for maintaining a clear and organized development environment
Configuration discovery in a software development context, are really just a function of very few 'core' abstract entities
Updating readmes etc is typically a manual process that non-one does.
For a developer the effort of writing a template is not bigger than writing the file directly
The idea of this project is to only define the 'core' entities and then define everything else with functions of those

# Objectives
1. Make it really easy to find configuration related information for developers 
2. Make naming conventions and standards explicit
3. Make automation of a much larger part of the development process
4. Serve as a build-time resource for automation tools

# Technology
TypeScript and node are chosen, so that a server is not required to edit and view resources. Engine should also work client-side only.
Mustache is choosen as template language since it available on so many platforms and have a clear boundry of being logic-less.
gray-matter - for getting metadata from mustache templates
Json-Schema will be used to express the framework as well as the resoueces it holds.
Frontend will be build vith a minimum of vanilla js. Front-end will be "pure HTML" as much as possible. All markup will be minimalistic and semanticly correct. Pico css class-less for styling.
isomorphic-git lib will be used as abstraction for storage
CodeMirror 6 will be used for editing resources.

# Architecture

## Resource tree – rest centric
Conceptually, the app will be a route-based resource tree. Collections will make up the resources tree. The default loader will have a set of a few collections making up the url structure


## Concepts for user of shadow
### instance
One 'installation' of this project. Essentially a git repo containing definitions of producers and resources

### content - IContent
Base interface for both producers, resources. 

### surl
A short internal url that can be used to reference producers

### producer IProducer 
Producers is the data abstraction in this project.
A producer is a directory with a schema.json describing the entity the producer produces
A directory with 
- schema.json describing the entity inside the producer.
- sources.json contains a list of surls to describe what this producer is derived from.

### collection – ICollection (subclass of producer)
Represents materialized data in this project.
A collection has everything that a producer has plus
(sources.json is in this case informational only for a future state where the collection will be implemented)
- data.json contains, has an array where each item is an instance of the entity described in the schema.json
- OR subfolders where each subfolder is an instance of the entity described in the schema.json in this case schema can onnly be a string mapping to the folder name.

### reference – IReference (subclass of producer)
Is a producer of data that fetches it from data from the outside of this instance.
A reference has everything that a producer has plus a reference.ts exporting an instance of the IReference 
interface.

### resource - IResource
An output of an template that you can reach via the resource tree
 
### resource template - IResourceTemplate
A template that defines the output of a resource together with matter meta-data data

### resource meta-data
The matter meta-data that is used to define the resource template. Plus schema 

## Internal concepts – Pluggable interfaces making up the application

### router – (IRouter       resolve(url : Url) : IResource)
Takes an external url 'stripped from root context' and returns either a json-body with a representation of the 'resource-tree' like collection or a template. Or an actual resource.

### internal-router - (IInternalRouter    resolve(url: Surl) : IProducer<TData>)
Takes an internal surl and returns a

### loader - (ILoader    load(producer: IProducer) : data : Array<TData>)
Takes an IProducer and returns an array of data.

### persister - (IPersister
persist(url: Surl, def : IResource) : void
persist(url: Surl, def : IProducer) : void
persist(data: Surl, item : Object) : void

Persist 

### engine - IEngine (url: Url) : IRenderedTemplateOutput
Takes an external url and strips it from the root context.
Calls the router and gets the resource.
Examines resource meta-data.
Iterates over sources in resource meta-data.
    — Calls internal-router on each source.
    — Calls loader on with each producer.

Then executes the template passing data from sources and returns the result.

### server - IServer(config : IConfig)
IServer 
    - method for accepting requests
    - Should be instantiated with a config object.

### config - IConfig
IConfig - a config contains instances of router, internal-router, loader and engine. Making up the application.

### system collections
There will be a few system collections that are always available, hard-coded in the application.




