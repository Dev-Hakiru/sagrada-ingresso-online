
import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const TooltipExample: React.FC = () => {
  const [count, setCount] = useState(0);
  const [tooltipMessage, setTooltipMessage] = useState("Clique para incrementar");

  const handleClick = () => {
    setCount(prev => prev + 1);
    setTooltipMessage(`Clicado ${count + 1} vez(es)`);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Exemplo de Tooltip com useState</h3>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={handleClick} variant="outline">
            Contador: {count}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default TooltipExample;
