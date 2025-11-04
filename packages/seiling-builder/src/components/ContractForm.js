import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { ActionIcon, Button, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
/**
 * Parse Solidity type to determine input component
 */
function parseSolidityType(type) {
    // Check for arrays
    if (type.includes('[]') || type.includes('[')) {
        return {
            component: 'array',
            isArray: true,
            baseType: type.replace(/\[\d*\]/g, '').replace('[]', ''),
        };
    }
    // Check for struct (complex types)
    if (type.startsWith('tuple')) {
        return {
            component: 'struct',
            isArray: false,
            baseType: 'tuple',
        };
    }
    // Check for numeric types
    if (type.startsWith('uint') ||
        type.startsWith('int') ||
        type === 'uint256' ||
        type === 'int256') {
        return {
            component: 'number',
            isArray: false,
            baseType: type,
        };
    }
    // Check for boolean
    if (type === 'bool') {
        return {
            component: 'select',
            isArray: false,
            baseType: 'bool',
        };
    }
    // Default to text input
    return {
        component: 'text',
        isArray: false,
        baseType: type,
    };
}
/**
 * Render input for a single ABI parameter
 */
function renderInput(input, value, onChange) {
    const { component, isArray, baseType } = parseSolidityType(input.type);
    // Handle arrays
    if (isArray || component === 'array') {
        const arrayValue = Array.isArray(value) ? value : value ? [value] : [];
        return (_jsxs(Stack, { gap: "xs", children: [_jsxs(Text, { size: "sm", fw: 500, children: [input.name, " (", input.type, ")"] }), arrayValue.map((item, index) => (_jsxs(Group, { gap: "xs", children: [_jsx(TextInput, { style: { flex: 1 }, value: item, onChange: (e) => {
                                const newArray = [...arrayValue];
                                newArray[index] = e.target.value;
                                onChange(newArray);
                            }, placeholder: `${input.name}[${index}]` }), _jsx(ActionIcon, { color: "red", variant: "light", onClick: () => {
                                const newArray = arrayValue.filter((_, i) => i !== index);
                                onChange(newArray.length > 0 ? newArray : []);
                            }, children: _jsx(IconMinus, { size: 16 }) })] }, index))), _jsx(Button, { size: "xs", variant: "light", leftSection: _jsx(IconPlus, { size: 14 }), onClick: () => onChange([...arrayValue, '']), children: "Add Item" })] }));
    }
    // Handle boolean
    if (component === 'select' && baseType === 'bool') {
        return (_jsx(Select, { label: `${input.name} (${input.type})`, data: [
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' },
            ], value: value?.toString() || '', onChange: (val) => onChange(val === 'true'), placeholder: "Select boolean value" }));
    }
    // Handle numbers
    if (component === 'number') {
        return (_jsx(NumberInput, { label: `${input.name} (${input.type})`, value: value || '', onChange: (val) => onChange(val), placeholder: `Enter ${input.name}` }));
    }
    // Default to text input (address, string, bytes, etc.)
    return (_jsx(TextInput, { label: `${input.name} (${input.type})`, value: value || '', onChange: (e) => onChange(e.target.value), placeholder: `Enter ${input.name}` }));
}
/**
 * ContractForm component for dynamic ABI parameter forms
 */
export function ContractForm({ inputs, values, onChange }) {
    const handleChange = (name, value) => {
        onChange({
            ...values,
            [name]: value,
        });
    };
    if (inputs.length === 0) {
        return (_jsx(Text, { size: "sm", c: "dimmed", ta: "center", py: "md", children: "This function has no parameters" }));
    }
    return (_jsx(Stack, { gap: "md", children: inputs.map((input) => (_jsx("div", { children: renderInput(input, values[input.name], (value) => handleChange(input.name, value)) }, input.name))) }));
}
