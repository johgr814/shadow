## Milestone 1 setup

1. Read your general .junie/guidelines.md
2. Read readme file
3. This project will be a mix backend frontend project.
4. Initially we start with only frontend and running the solution in frontend mode.
5. All setups should be professional and use pre-sets where possible.
6. Aim for strict standards.
7. This is being a vanilla project not based on any framework.
8. Use the most up-to-date settings where possible
9. Use biome for linting and formatting. Autofix as much as possible even unsafe.
10. Use knip for looking for unused dependencies. Autofix as much as possible even unsafe.
11. Ues tsc for type checking.
12. Use playwright for testing.
13. Make a index.html and a main.ts file and test to verify.
14. Setup test coverage limit to 80%
15. Make a unit test for main.ts
16. Make a e2e test for index.html
17. Setup standard npm targets for, developing and building, packaging and ci  {github actions}
18. Make a npm target that updates all dependencies to latest version.
19. Ci should fail if any lint, knip, typecheck, fails. 

## Milestone 1 Review: 
1. Review the project structure and setup
   - make sure it is clean and well organized.
   - make sure it is following best practices

2. Review that linting and formatting is working and applies to all code as well as test code and config files.
3. Make sure all configs have schemas available where applicable
4. commit and push your changes.

## Milestone 2 setup
Worspaces and pnpm should be introduced to that that all components becomes packages in shared folder.


## Use case 1, create a resource
### Scenario:
User surfs to index page, since the installation is empty he will be prompted to create a colletion or resource. User chooses to create a resource. App provides a template editor and when user presses save stores the template. User is redirected back to index.html that now shows a list of resources with the newly created item. 

### Implementation details:
Index pages pass the "/" route to ServerBackend.ts. ServerBackend.ts calls directly calls engine.ts that calls router for the route("/") and so on. A 200 response is sent back. UI then shows available actons to the user.
User click on "Create new resource" and the app navigates to the new resource page (new-resource.html). This is full page redirect. No state is maintained. Post action in new resource page will post to "realtive current path" only "/" in this case.
User fills in the template in the template editor. 
####
new-resource.html
Consists of third party template editor. And an html for that can submit the template. Template is posted as a IResourceTemplate. 

User click on "Save " the payload is sent to the backend via normal http form/post.
Validation failures rerenders the page with errors.
Create collection is not implemented in this use case.
Engine.ts calls router and since it is a post storage will be called. Storage uses ismorphic-git to store the template in a the local instance folder.
A target for starting the app shuold be added to package.json. 
It should create a new folder 'instances' if it is not already there. A sub folder called e2e should be created. It should be initialized as a git repo for use by isomorphic-git. It should be deleted and recreated before each test run.
The app will then be configured to use this local folder as initial storage with isomorphic-git.
Domain folder in shared should be deleted and the code thats inside it as well. They were only used for testing setup.
Existing test-cases should be deleted as they are obsolete by this use case.
main.ts should be deleted.
title.ts should be deleted.
ServerBackend.ts will be the only component inside the backend folder right now. 
For this scenario all js code should be executed backend-side. But be kept in shared folder, since next task will be making the client backend.
Interaction wih git server will be done via storage.ts code in shared folder as earlier stated
Linting and formatting is working and applies to all code as well as test code - test should be included

No primitives will be allowed in any interfaces all arguments and return values should be typed.

###
a e2e test file for named 'resource.create' should be run as use case 1 stipulates.







