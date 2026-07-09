<?php

namespace App\Domain\Solicitudes\Exceptions;

class InvalidWorkflowTransitionException extends \DomainException
{
    public function __construct(string $message = 'Transición de estado no válida.')
    {
        parent::__construct($message);
    }
}
