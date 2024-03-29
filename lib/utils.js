
/**
 * @description: 生成表单控件使用的option
 * @param arr 原始list Record<string, string>[] | string[]
 * @param label 赋值label的key名 string
 * @param value 赋值value的key名 string
 * @param custom 自定义需要合并的对象 ?: {}
 * @return option[]
 */
export const getOption = (arr, label, value, custom) => {
  if (!Array.isArray(arr)) return []
  const options = []
  let customKeys = []
  if (custom) customKeys = Object.keys(custom)
  arr.forEach((item) => {
    let params = {
      label: typeof item === 'string' ? item : item[label],
      value: typeof item === 'string' ? item : item[value]
    }
    if (custom) {
      customKeys.forEach((key) => {
        params[key] = (item)[key]
      })
    }
    options.push(params)
  })
  return options
}

/**
 * @description: 获取表单配置中指定的对象
 * @param formOption 表单配置 formOption[]
 * @param key 指定的key string
 * @return formOption

 */
export const getLabel = (formOption, key) => {
  return formOption.filter(i => (i.formItem.prop) === key)[0] || {
    type: 'input',
    formItem: {
      prop: '',
      label: '',
    }
  }
}

/**
 * @description: 校验
 * @param rule rule对象 rule
 * @param propVal 对应prop的值 string
 * @param callback Function
 */
const getValidator = (
  rule,
  propVal,
  callback
) => {
  const type = {
    'input': '输入',
    'input-number': '输入',
    'select': '选择',
    'tree-select': '选择',
    'cascader': '选择',
    'radio': '选择',
    'radio-button': '选择',
    'checkbox': '选择',
    'checkbox-button': '选择',
    'datetime': '选择',
    'time': '选择',
    'switch': '选择',
    'upload': '上传',
  }
  const params = getLabel(rule.formOption, rule.field)
  if (Array.isArray(propVal) && propVal.length === 0) return callback(new Error(`请${(type[params.type] || '完善')}${params.formItem.label}`))
  if (!propVal) return callback(new Error(`请${(type[params.type] || '完善')}${params.formItem.label}`))
  if (!params?.formItem?.rules) return callback();
  if (typeof params.formItem.rules.validator === 'function') {
    params.formItem.rules.validator(rule, propVal).then(() => {
      return callback()
    }).catch((res) => {
      return callback(new Error(res !== 'err' ? res : (params?.formItem.rules?.message || '')))
    })
  } else {
    if (!(params.formItem.rules.validator).test(propVal)) {
      return callback(new Error(params.formItem.rules.message || '格式有误'))
    } else {
      return callback();
    }
  }
}

/**
 * @description: 生成校验配置
 * @param formOption 表单配置 formOption[]
 * @param omit 不需要验证的key  string[]
 * @return FormRules
 */
export const getRules = (formOption, omit = []) => {
  let rules = {}
  formOption.forEach((i) => {
    const prop = (typeof i === 'string' ? i : (i.formItem.prop));
    if (!omit.includes(prop)) rules[prop] = [{ required: true, validator: getValidator, trigger: i.formItem?.rules?.trigger || 'blur', formOption }]
  })
  return rules
}

/**
 * @description: 生成校验配置
 * @param formOption 表单配置 formOption[]
 * @param omit 不需要验证的key  string[]
 * @return formOption
 */
export const setRequired = (formOption, omit = []) => {
  const type = {
    'input': '输入',
    'input-number': '输入',
    'select': '选择',
    'tree-select': '选择',
    'cascader': '选择',
    'radio': '选择',
    'radio-button': '选择',
    'checkbox': '选择',
    'checkbox-button': '选择',
    'datetime': '选择',
    'time': '选择',
    'switch': '选择',
    'upload': '上传',
  }
  formOption.forEach((i) => {
    const requiredObj = { required: true, message: `请${(type[i.type] || '完善')}${i.formItem.label || ''}` , trigger: 'change' }
    if (!omit.includes(i.formItem.prop)) {
      if (!i.formItem.rules) {
        i.formItem.rules = [requiredObj]
      } else if (Array.isArray(i.formItem.rules)) {
        //  && i.formItem.rules.filter(i => i.required && typeof i.required === 'boolean' && i.required === true).length === 0
        i.formItem.rules.unshift(requiredObj)
      } else if (!Array.isArray(i.formItem.rules)) {
        i.formItem.rules = [requiredObj,i.formItem.rules]
      }
      for (let index = 0; index < i.formItem.rules.length; index++) {
        let item = i.formItem.rules[index]
        if (item.validator && typeof item.validator !== 'function') {
          item.pattern = item.validator
          item.message = item.message || '格式有误'
          delete item.validator
        }
      }
    }
  })
  return formOption
}
