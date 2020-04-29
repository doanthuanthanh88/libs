export function loadConfig(config) {
  function loadEnvConfig(obj, pro, prefix) {
    for (const k in obj) {
      if (typeof obj[k] === 'object') {
        loadEnvConfig(obj[k], pro, prefix + k + '.')
      } else if (Array.isArray(obj[k])) {
        obj[k].forEach((objki, i) => {
          loadEnvConfig(objki, pro, prefix + k + '.' + i + '.')
        })
      } else {
        if (pro[prefix + k] !== undefined) {
          if (typeof obj[k] === 'boolean') {
            obj[k] = pro[prefix + k] === 'true'
          } else if (typeof obj[k] === 'number') {
            obj[k] = +pro[prefix + k]
          } else {
            obj[k] = pro[prefix + k]
          }
        }
      }
    }
    return obj
  }

  return loadEnvConfig(config, process.env, '')
}
