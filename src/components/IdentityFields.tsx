import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {maskDocument} from "@/utils/brazilianDocument";

type DocumentType = "cpf" | "cnpj";

interface IdentityFieldsProps {
    documentType: DocumentType;
    onDocumentTypeChange?: (type: DocumentType) => void;
    allowCnpj?: boolean;
    document: string;
    onDocumentChange: (value: string) => void;
    birthDate: string;
    onBirthDateChange: (value: string) => void;
    documentError?: string;
    birthDateError?: string;
    disabled?: boolean;
}

const IdentityFields = ({
    documentType,
    onDocumentTypeChange,
    allowCnpj = false,
    document,
    onDocumentChange,
    birthDate,
    onBirthDateChange,
    documentError,
    birthDateError,
    disabled,
}: IdentityFieldsProps) => {
    const documentLabel = documentType === "cnpj" ? "CNPJ" : "CPF";

    return (
        <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
                {allowCnpj ? (
                    <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="identity-document">{documentLabel}</Label>
                        <select
                            aria-label="Tipo de documento"
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                            value={documentType}
                            disabled={disabled}
                            onChange={(event) => {
                                const next = event.target.value === "cnpj" ? "cnpj" : "cpf";
                                onDocumentTypeChange?.(next);
                                onDocumentChange(maskDocument(document, next));
                            }}
                        >
                            <option value="cpf">CPF</option>
                            <option value="cnpj">CNPJ</option>
                        </select>
                    </div>
                ) : (
                    <Label htmlFor="identity-document">{documentLabel}</Label>
                )}
                <Input
                    id="identity-document"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={documentType === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00"}
                    value={document}
                    disabled={disabled}
                    onChange={(event) => onDocumentChange(maskDocument(event.target.value, documentType))}
                    required
                />
                {documentError ? <p className="text-xs text-destructive">{documentError}</p> : null}
            </div>
            <div className="space-y-2">
                <Label htmlFor="identity-birth-date">Data de nascimento</Label>
                <Input
                    id="identity-birth-date"
                    type="date"
                    value={birthDate}
                    disabled={disabled}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => onBirthDateChange(event.target.value)}
                    required
                />
                <p className="text-xs text-muted-foreground">Necessário ter 18 anos ou mais para comprar e vender.</p>
                {birthDateError ? <p className="text-xs text-destructive">{birthDateError}</p> : null}
            </div>
        </div>
    );
};

export default IdentityFields;
