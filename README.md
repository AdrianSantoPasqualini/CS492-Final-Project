# cs492-final-project

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

===== Initial Pitch =====

We wish to develop a game that demonstrates how easily an AI could achieve unexpected outcomes if the training data is not chosen carefully. These unexpected outcomes might be disastrous in cases where lives are on the line. This game lets users train a lethal autonomous weapons system. They would choose samples from a dataset (possibly representing an alien/robot city https://robohash.org/) that would go into the training/testing sets for the AI model. They could then watch how their model performs (how many civilians it destroys, how many enemies it lets in, etc) and potentially iterate on the model datasets and parameters.
