import { ActionIcon, Button, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

export interface ABIInput {
  name: string;
  type: string;
  internalType?: string;
  indexed?: boolean;
}

interface ContractFormProps {
  inputs: ABIInput[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

/**
 * Parse Solidity type to determine input component
 */
function parseSolidityType(type: string): {
  component: 'text' | 'number' | 'select' | 'array' | 'struct';
  isArray: boolean;
  baseType: string;
} {
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
  if (
    type.startsWith('uint') ||
    type.startsWith('int') ||
    type === 'uint256' ||
    type === 'int256'
  ) {
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
function renderInput(
  input: ABIInput,
  value: any,
  onChange: (value: any) => void
): React.ReactNode {
  const { component, isArray, baseType } = parseSolidityType(input.type);

  // Handle arrays
  if (isArray || component === 'array') {
    const arrayValue = Array.isArray(value) ? value : value ? [value] : [];
    return (
      <Stack gap="xs">
        <Text size="sm" fw={500}>
          {input.name} ({input.type})
        </Text>
        {arrayValue.map((item: any, index: number) => (
          <Group key={index} gap="xs">
            <TextInput
              style={{ flex: 1 }}
              value={item}
              onChange={(e) => {
                const newArray = [...arrayValue];
                newArray[index] = e.target.value;
                onChange(newArray);
              }}
              placeholder={`${input.name}[${index}]`}
            />
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => {
                const newArray = arrayValue.filter((_: any, i: number) => i !== index);
                onChange(newArray.length > 0 ? newArray : []);
              }}
            >
              <IconMinus size={16} />
            </ActionIcon>
          </Group>
        ))}
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={() => onChange([...arrayValue, ''])}
        >
          Add Item
        </Button>
      </Stack>
    );
  }

  // Handle boolean
  if (component === 'select' && baseType === 'bool') {
    return (
      <Select
        label={`${input.name} (${input.type})`}
        data={[
          { value: 'true', label: 'True' },
          { value: 'false', label: 'False' },
        ]}
        value={value?.toString() || ''}
        onChange={(val) => onChange(val === 'true')}
        placeholder="Select boolean value"
      />
    );
  }

  // Handle numbers
  if (component === 'number') {
    return (
      <NumberInput
        label={`${input.name} (${input.type})`}
        value={value || ''}
        onChange={(val) => onChange(val)}
        placeholder={`Enter ${input.name}`}
      />
    );
  }

  // Default to text input (address, string, bytes, etc.)
  return (
    <TextInput
      label={`${input.name} (${input.type})`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${input.name}`}
    />
  );
}

/**
 * ContractForm component for dynamic ABI parameter forms
 */
export function ContractForm({ inputs, values, onChange }: ContractFormProps) {
  const handleChange = (name: string, value: any) => {
    onChange({
      ...values,
      [name]: value,
    });
  };

  if (inputs.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        This function has no parameters
      </Text>
    );
  }

  return (
    <Stack gap="md">
      {inputs.map((input) => (
        <div key={input.name}>
          {renderInput(input, values[input.name], (value) => handleChange(input.name, value))}
        </div>
      ))}
    </Stack>
  );
}

