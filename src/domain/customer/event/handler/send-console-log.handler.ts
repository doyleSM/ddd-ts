import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerAddressChangedEvent from "../customer-address-changed.event";

export default class EnviaConsoleLogHandler
  implements EventHandlerInterface<CustomerAddressChangedEvent>
{
  handle({dataTimeOccurred, eventData}: CustomerAddressChangedEvent): void {
    const {id, nome, endereco} = eventData
    console.log(`Endereço do cliente: ${id}, ${nome} alterado para: ${endereco}`); 
  }
}
