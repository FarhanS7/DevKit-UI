const StyleDictionary = require('style-dictionary');

// Register custom name transform to strip 'primitive'/'semantic'/'typography' and convert camelCase
StyleDictionary.registerTransform({
  name: 'name/custom/kebab',
  type: 'name',
  transformer: (token) => {
    let path = token.path.filter(segment => segment !== 'primitive' && segment !== 'semantic');
    
    // Strip "typography" category prefix to match CSS conventions like --font-size-* instead of --typography-font-size-*
    if (path[0] === 'typography') {
      path = path.slice(1);
    }
    
    return path
      .join('-')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }
});

const filterNonPrimitives = (token) => {
  if (token.path[0] === 'color') {
    return token.path[1] === 'semantic';
  }
  return true;
};

module.exports = {
  source: ['tokens.json'],
  platforms: {
    css: {
      transforms: [
        'attribute/cti',
        'name/custom/kebab',
        'time/seconds',
        'content/icon',
        'size/rem',
        'color/css'
      ],
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: {
          selector: ':root',
          outputReferences: false
        },
        filter: filterNonPrimitives
      }]
    }
  }
};
