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
TypeScript and node are chosen since so that a server is not required to edit and view templates.
Mustache is choosen as template language since it available on so many platforms and have a clear boundry of being logic-less.
gray-matter - for getting metadata from mustache templates
Json-Schema will be used to express the framework as well as the resoueces it holds.

# Architecture

## Concepts for user of shadow
### instance
One 'installation' of this project. Will in future be backed by git repo.
The instance is a collection of templates and collections.

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

### reference – IReference (subclass of producer)
Is a producer of data that fetches it from data from the outside of this instance.
A reference has everything that a producer has plus a reference.ts exporting an instance of the IReference 
interface.

### resource :IResource
An output of an template that you can reach via the resource tree
 
### resource template
A template that defines the output of a resource together with matter meta-data data

### resource meta-data
The matter meta-data that is used to define the resource template. Plus schema 

## Internal concepts 

### router – (IExternalRouter       resolve(url : Url) : IResource)
Takes an external url 'stripped from root context' and returns a resource.

### internal-router - (IInternalRouter    resolve(url: Surl) : IProducer<TData>)
Takes an internal surl and returns a producer.

## loader - (ILoader    load(producer: IProducer) : data : Array<TData>)
Takes an IProducer and returns an array of data.

## engine - IEngine (url: Url) : IRenderedTemplateOutput
Takes an external url and strips it from the root context.
The calls the router and and gets the resource.
Iterates over sources in resource meta-data.
Calls internal-router on each source.
Calls loader on with each producer.
Then executes the template passing data and returns the result.

# server - IServer(config : IConfig)
IServer 
    - method for accepting requests






