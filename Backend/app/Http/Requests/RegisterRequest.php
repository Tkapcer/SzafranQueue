<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Http\UploadedFile;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id')->where('is_selectable', true),
                ],
            'password' => 'required|min:8',
            'id_card_photo_front' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:5120|required_with:id_card_photo_back',
            'id_card_photo_back' => [
                Rule::requiredIf(fn () => $this->frontIsImage()),
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:5120',
            ],
        ];
    }

    private function frontIsImage(): bool
    {
        $front = $this->file('id_card_photo_front');

        return $front instanceof UploadedFile
            && $front->getMimeType() !== 'application/pdf';
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required',
            'name.string' => 'Name must be a string',
            'name.max' => 'Name cannot exceed 255 characters',
            'surname.required' => 'Surname is required',
            'surname.string' => 'Surname must be a string',
            'surname.max' => 'Surname cannot exceed 255 characters',
            'email.required' => 'Email is required',
            'email.email' => 'Email must be a valid email address',
            'email.unique' => 'Email already exists',
            'role_id.required' => 'Role is required',
            'role_id.integer' => 'Role must be an integer',
            'role_id.exists' => 'Invalid role',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'id_card_photo_front.file' => 'ID card photo front must be a file',
            'id_card_photo_front.mimes' => 'ID card photo front must be a JPEG, PNG, JPG, WEBP, or PDF file',
            'id_card_photo_front.max' => 'ID card photo front cannot exceed 5MB',
            'id_card_photo_back.file' => 'ID card photo back must be a file',
            'id_card_photo_back.mimes' => 'ID card photo back must be a JPEG, PNG, JPG, WEBP, or PDF file',
            'id_card_photo_back.max' => 'ID card photo back cannot exceed 5MB',
            'id_card_photo_back.required' => 'Back of the ID card is required when the front is a photo',
            'id_card_photo_front.required_with' => 'Front of the ID card is required when the back is provided',
        ];
    }
}
