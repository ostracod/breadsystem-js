
# BreadSystem JS

This project is a JavaScript implementation of BreadSystem. In the future I would like to implement BreadSystem in C or some kind of processor assembly code.

## Usage

The assembler requires Node.js 12 and TypeScript 3.6 or higher.

Clone https://github.com/ostracod/breadsystem-spec in the parent directory of `breadsystem-js`, then generate `bytecodeInstructions.json`:

```
# Inside breadsystem-spec:
node ./generate.js
```

Clone https://github.com/ostracod/breadbytecode-asm in the parent directory of `breadsystem-js`, then compile the assembler:

```
# Inside breadbytecode-asm:
tsc
```

Assemble the example applications and interfaces:

```
# Inside breadsystem-js:
./exampleVolume/assembly/fake.bash
```

Compile and run BreadSystem JS:

```
# Inside breadsystem-js:
tsc
node ./dist/breadSystem.js
```


