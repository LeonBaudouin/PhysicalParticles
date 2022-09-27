export default function pseudoDeepAssign<T extends object>(target: T, source: Partial<T>) {
  for (const [key, value] of Object.entries(source)) {
    if (target[key] == null) continue
    if (typeof value === 'object' && value) {
      if ('x' in value) target[key]['x'] = value['x']
      if ('y' in value) target[key]['y'] = value['y']
      if ('z' in value) target[key]['z'] = value['z']
      if ('w' in value) target[key]['w'] = value['w']
      if ('min' in value) target[key]['min'] = value['min']
      if ('max' in value) target[key]['max'] = value['max']
    } else {
      target[key] = value
    }
  }
}
