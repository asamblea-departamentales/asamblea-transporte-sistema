<x-dynamic-component
    :component="$getFieldWrapperView()"
    :field="$field"
>
    <x-signature-pad :state-path="$getStatePath()" />
</x-dynamic-component>